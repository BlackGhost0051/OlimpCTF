import Docker from 'dockerode';

class DockerService{

    private MIN_PORT = 10000;
    private MAX_PORT = 10010;

    RESTART_TIME = 60 * 60000; // 60 minutes
    private docker: Docker;

    constructor() {
        this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
    }

    async startExampleWebTask() {
        try { 
            const stream = await this.docker.buildImage({
                context: '/app/tasks/example-web-task',
                src: ['.']
            }, { t: 'example-web-task:latest' });

            await new Promise((resolve, reject) => {
                this.docker.modem.followProgress(stream, (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });

            try {
                const existingContainer = this.docker.getContainer('example-web-task-container');
                const containerInfo = await existingContainer.inspect();

                if (containerInfo.State.Running) {
                    console.log("Container is already running");
                    return existingContainer;
                } else {
                    await existingContainer.remove();
                    console.log("Removed stopped container");  
                }
            } catch (error) {
                console.log("No existing container found");
            }


            const container = await this.docker.createContainer({
                Image: 'example-web-task:latest',
                name: 'example-web-task-container',
                ExposedPorts: { '80/tcp': {} },
                HostConfig: {
                    PortBindings: {
                        '80/tcp': [{ HostPort: '8080' }]
                    }
                }
            });

            await container.start();
            console.log('Example web task started on port 8080');
            return container;

        } catch (error) {
            console.error('Error starting example web task:', error);  
            throw error;
        } 
    }

    startAllContainers(){

    }

    verifyContainerStatus(){

    }


    restartAllContainers(){

    }
}

export default DockerService;