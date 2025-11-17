import Docker from 'dockerode';
import DatabaseService from './database.service';
import path from 'path';
import fs from 'fs';
import { config } from '../../config';

interface ContainerInfo {
    url: string;
    expires_at: Date;
    status: string;
    host_port: number;
}

class ContainerService {
    private docker: Docker;
    private databaseService: DatabaseService;
    private MIN_PORT = 10000;
    private MAX_PORT = 20000;
    private CONTAINER_TIMEOUT = 60 * 60 * 1000; // 60 minutes
    private baseTaskFolder = path.resolve(__dirname, '../../../tasks');

    constructor() {
        this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
        this.databaseService = new DatabaseService();
    }


    // Start or get existing container for a user
    public async startUserContainer(userId: string, taskId: string): Promise<ContainerInfo> {
        const existing = await this.databaseService.getUserContainer(userId, taskId);

        if (existing && existing.status === 'running') {
            try {
                const container = this.docker.getContainer(existing.container_id);
                const containerInfo = await container.inspect();

                if (containerInfo.State.Running) {
                    console.log(`User ${userId} already has running container for ${taskId}`);
                    return {
                        url: existing.url,
                        expires_at: existing.expires_at,
                        status: 'running',
                        host_port: existing.host_port
                    };
                } else {
                    await this.databaseService.deleteUserContainer(userId, taskId);
                }
            } catch (error) {
                await this.databaseService.deleteUserContainer(userId, taskId);
            }
        }

        const taskMeta = await this.databaseService.getTaskMetadata(taskId);
        if (!taskMeta || !taskMeta.has_container) {
            throw new Error(`Task ${taskId} does not have a container`);
        }

        const hostPort = await this.findAvailablePort();

        await this.buildImageIfNeeded(taskId);

        const containerName = `${taskId}-${userId}-${Date.now()}`;
        const expiresAt = new Date(Date.now() + this.CONTAINER_TIMEOUT);

        const container = await this.docker.createContainer({
            Image: `task-${taskId}:latest`,
            name: containerName,
            ExposedPorts: { [`${taskMeta.internal_port}/tcp`]: {} },
            HostConfig: {
                PortBindings: {
                    [`${taskMeta.internal_port}/tcp`]: [{ HostPort: String(hostPort) }]
                },
                AutoRemove: false,
                RestartPolicy: { Name: 'no' },
                // Resource limits
                Memory: 512 * 1024 * 1024,      // 512MB
                MemorySwap: 512 * 1024 * 1024,
                CpuShares: 512,
                PidsLimit: 100
            }
        });

        await container.start();
        console.log(`Started container ${containerName} on port ${hostPort}`);

        const url = `http://${config.server_host || 'localhost'}:${hostPort}`;

        await this.databaseService.createUserContainer({
            user_id: userId,
            task_id: taskId,
            container_id: container.id,
            container_name: containerName,
            host_port: hostPort,
            url: url,
            expires_at: expiresAt
        });

        return {
            url,
            expires_at: expiresAt,
            status: 'running',
            host_port: hostPort
        };
    }

    public async stopUserContainer(userId: string, taskId: string): Promise<void> {
        const existing = await this.databaseService.getUserContainer(userId, taskId);

        if (!existing) {
            throw new Error('Container not found');
        }

        try {
            const container = this.docker.getContainer(existing.container_id);
            await container.stop();
            await container.remove();
            console.log(`Stopped and removed container ${existing.container_name}`);
        } catch (error) {
            console.error(`Failed to stop container:`, error);
        }

        await this.databaseService.deleteUserContainer(userId, taskId);
    }

    public async getContainerStatus(userId: string, taskId: string): Promise<ContainerInfo | null> {
        const existing = await this.databaseService.getUserContainer(userId, taskId);

        if (!existing) {
            return null;
        }

        try {
            const container = this.docker.getContainer(existing.container_id);
            const containerInfo = await container.inspect();

            if (!containerInfo.State.Running) {
                await this.databaseService.deleteUserContainer(userId, taskId);
                return null;
            }

            return {
                url: existing.url,
                expires_at: existing.expires_at,
                status: 'running',
                host_port: existing.host_port
            };
        } catch (error) {
            await this.databaseService.deleteUserContainer(userId, taskId);
            return null;
        }
    }

    private async findAvailablePort(): Promise<number> {
        const usedPorts = await this.databaseService.getUsedPorts();

        for (let port = this.MIN_PORT; port <= this.MAX_PORT; port++) {
            if (!usedPorts.includes(port)) {
                return port;
            }
        }

        throw new Error('No available ports in range');
    }

    private async buildImageIfNeeded(taskId: string): Promise<void> {
        const imageName = `task-${taskId}:latest`;

        try {
            await this.docker.getImage(imageName).inspect();
            console.log(`Image ${imageName} already exists`);
            return;
        } catch (error) {
            console.log(`Image ${imageName} not found, building...`);
        }

        const taskPath = path.join(this.baseTaskFolder, taskId, 'web');

        if (!fs.existsSync(taskPath)) {
            throw new Error(`Task directory not found: ${taskPath}`);
        }

        const dockerfilePath = path.join(taskPath, 'Dockerfile');
        if (!fs.existsSync(dockerfilePath)) {
            throw new Error(`Dockerfile not found in: ${taskPath}`);
        }

        const stream = await this.docker.buildImage({
            context: taskPath,
            src: ['.']
        }, { t: imageName });

        await new Promise((resolve, reject) => {
            this.docker.modem.followProgress(stream, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        console.log(`Image ${imageName} built successfully`);
    }

    public async cleanupExpiredContainers(): Promise<void> {
        const expired = await this.databaseService.getExpiredContainers();

        console.log(`Found ${expired.length} expired containers`);

        for (const record of expired) {
            try {
                const container = this.docker.getContainer(record.container_id);
                await container.stop();
                await container.remove();
                console.log(`Cleaned up expired container: ${record.container_name}`);

                await this.databaseService.deleteUserContainer(record.user_id, record.task_id);
            } catch (error) {
                console.error(`Failed to cleanup container ${record.container_name}:`, error);
                await this.databaseService.updateContainerStatus(record.user_id, record.task_id, 'stopped');
            }
        }
    }
}

export default ContainerService;
