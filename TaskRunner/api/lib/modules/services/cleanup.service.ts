import ContainerService from './container.service';

class CleanupService {
    private containerService: ContainerService;
    private cleanupInterval: NodeJS.Timeout | null = null;
    private CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

    constructor() {
        this.containerService = new ContainerService();
    }

    public start(): void {
        if (this.cleanupInterval) {
            console.log('Cleanup service already running');
            return;
        }

        console.log('Starting container cleanup service...');
        console.log(`Cleanup will run every ${this.CLEANUP_INTERVAL / 1000 / 60} minutes`);

        this.runCleanup();

        this.cleanupInterval = setInterval(() => {
            this.runCleanup();
        }, this.CLEANUP_INTERVAL);
    }

    public stop(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            console.log('Cleanup service stopped');
        }
    }

    private async runCleanup(): Promise<void> {
        try {
            console.log(`[${new Date().toISOString()}] Running container cleanup...`);
            await this.containerService.cleanupExpiredContainers();
            console.log(`[${new Date().toISOString()}] Cleanup completed`);
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}

export default CleanupService;
