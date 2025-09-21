import axios from "axios";

class TaskRunnerService{
    api_url: string = "http://task-runner:5001/api/challenge";


    async addTask(id: string, flag: string) {
        try {
            const response = await axios.post(this.api_url + "/task", {
                task_id: id,
                flag: flag,
            });

            return response.data;
        } catch (error) {
            throw new Error("Failed to create task");
        }
    }


    async deleteTask(task_id: string) {
        try {
            await axios.delete(this.api_url + "/task", {
                data: { task_id: task_id },
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            throw new Error("Failed to delete task");
        }
    }

    async verifyFlag(id: string, flag: string) {
        try {
            const response = await axios.post(this.api_url + "/verify_flag", {
                task_id: id,
                flag: flag,
            });

            // TODO: verify logic
            const data = response.data as { status: boolean };
            return data.status;
        } catch (error) {
            throw new Error("Failed to verify task");
        }
    }
}

export default TaskRunnerService;