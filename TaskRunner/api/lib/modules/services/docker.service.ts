import Docker from 'dockerode';
import * as fs from 'fs';
import * as path from 'path';

export interface TaskContainer {
    id: string;
    containerId?: string;
    status: 'creating' | 'running' | 'stopped' | 'error';
    ports?: { [key: string]: number };
    createdAt: Date;
    lastUpdated: Date;
}

export class DockerService {
    private docker: Docker;
    private containers: Map<string, TaskContainer> = new Map();

    constructor() {
        this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
    }

    async createTaskContainer(taskId: string): Promise<TaskContainer> {
        const taskPath = path.join('/app/tasks', taskId);

        if (!fs.existsSync(taskPath)) {
            throw new Error(`Task folder ${taskId} not found`);
        }

        const taskContainer: TaskContainer = {
            id: taskId,
            status: 'creating',
            createdAt: new Date(),
            lastUpdated: new Date()
        };

        this.containers.set(taskId, taskContainer);

        try {
            const dockerComposePath = path.join(taskPath, 'docker-compose.yml');
            const dockerfilePath = path.join(taskPath, 'Dockerfile');

            if (fs.existsSync(dockerComposePath)) {
                await this.createFromDockerCompose(taskId, taskPath);
            } else if (fs.existsSync(dockerfilePath)) {
                await this.createFromDockerfile(taskId, taskPath);
            } else {
                throw new Error(`No Docker configuration found in task ${taskId}`);
            }

            taskContainer.status = 'running';
            taskContainer.lastUpdated = new Date();

        } catch (error) {
            taskContainer.status = 'error';
            taskContainer.lastUpdated = new Date();
            throw error;
        }

        return taskContainer;
    }

    private async createFromDockerCompose(taskId: string, taskPath: string): Promise<void> {
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);

        const composeCommand = `cd ${taskPath} && docker-compose up -d --build`;

        try {
            const { stdout, stderr } = await execAsync(composeCommand);
            console.log(`Docker Compose output for task ${taskId}:`, stdout);

            if (stderr) {
                console.warn(`Docker Compose warnings for task ${taskId}:`, stderr);
            }

            const psCommand = `cd ${taskPath} && docker-compose ps --format json`;
            const { stdout: psOutput } = await execAsync(psCommand);

            if (psOutput.trim()) {
                const containers = psOutput.trim().split('\n').map(line => JSON.parse(line));
                const taskContainer = this.containers.get(taskId);
                if (taskContainer && containers.length > 0) {
                    taskContainer.containerId = containers[0].ID;
                }
            }

        } catch (error) {
            throw new Error(`Failed to start Docker Compose for task ${taskId}: ${error.message}`);
        }
    }

    private async createFromDockerfile(taskId: string, taskPath: string): Promise<void> {
        const imageName = `task-${taskId}`;
        const containerName = `task-container-${taskId}`;

        const stream = await this.docker.buildImage({
            context: taskPath,
            src: ['.']
        }, {
            t: imageName,
            dockerfile: 'Dockerfile'
        });

        await new Promise((resolve, reject) => {
            this.docker.modem.followProgress(stream, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const container = await this.docker.createContainer({
            Image: imageName,
            name: containerName,
            NetworkMode: 'olimpctf_app-network',
            HostConfig: {
                AutoRemove: true,
                RestartPolicy: { Name: 'unless-stopped' }
            }
        });

        await container.start();

        const taskContainer = this.containers.get(taskId);
        if (taskContainer) {
            taskContainer.containerId = container.id;
        }
    }

    async stopTaskContainer(taskId: string): Promise<void> {
        const taskContainer = this.containers.get(taskId);
        if (!taskContainer) {
            throw new Error(`Task container ${taskId} not found`);
        }

        const taskPath = path.join('/app/tasks', taskId);

        try {
            if (fs.existsSync(path.join(taskPath, 'docker-compose.yml'))) {
                const { exec } = require('child_process');
                const util = require('util');
                const execAsync = util.promisify(exec);

                const command = `cd ${taskPath} && docker-compose down`;
                await execAsync(command);
            } else if (taskContainer.containerId) {
                const container = this.docker.getContainer(taskContainer.containerId);
                await container.stop();
            }

            taskContainer.status = 'stopped';
            taskContainer.lastUpdated = new Date();

        } catch (error) {
            taskContainer.status = 'error';
            taskContainer.lastUpdated = new Date();
            throw error;
        }
    }

    async getTaskContainer(taskId: string): Promise<TaskContainer | null> {
        return this.containers.get(taskId) || null;
    }

    async listTaskContainers(): Promise<TaskContainer[]> {
        return Array.from(this.containers.values());
    }

    async removeTaskContainer(taskId: string): Promise<void> {
        await this.stopTaskContainer(taskId);
        this.containers.delete(taskId);

        try {
            const imageName = `task-${taskId}`;
            const image = this.docker.getImage(imageName);
            await image.remove();
        } catch (error) {
        }
    }

    async getContainerLogs(taskId: string): Promise<string> {
        const taskContainer = this.containers.get(taskId);
        if (!taskContainer || !taskContainer.containerId) {
            throw new Error(`Container for task ${taskId} not found`);
        }

        const container = this.docker.getContainer(taskContainer.containerId);
        const stream = await container.logs({
            stdout: true,
            stderr: true,
            timestamps: true,
            tail: 100
        });

        return stream.toString();
    }
}