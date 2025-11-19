import axios from "axios";
import FormData from "form-data";

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

    async uploadTask(task_id: string, flag: string, zipBuffer: Buffer) {
        try {
            const formData = new FormData();
            formData.append('task_id', task_id);
            formData.append('flag', flag);
            formData.append('task_zip', zipBuffer, { filename: `${task_id}.zip` });

            const response = await axios.post(this.api_url + "/upload_task", formData, {
                headers: formData.getHeaders(),
            });

            return response.data;
        } catch (error) {
            throw new Error("Failed to upload task");
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

            const data = response.data as { status: boolean };
            return data.status;
        } catch (error) {
            throw new Error("Failed to verify task");
        }
    }

    async startContainer(user_id: string, task_id: string) {
        try {
            const response = await axios.post(this.api_url + "/start_container", {
                user_id: user_id,
                task_id: task_id,
            });

            return response.data;
        } catch (error) {
            throw new Error("Failed to start container");
        }
    }

    async stopContainer(user_id: string, task_id: string) {
        try {
            const response = await axios.post(this.api_url + "/stop_container", {
                user_id: user_id,
                task_id: task_id,
            });

            return response.data;
        } catch (error) {
            throw new Error("Failed to stop container");
        }
    }

    async getTaskDetails(user_id: string, task_id: string){
        try {
            const response = await axios.get(
                `${this.api_url}/task_details/${task_id}/${user_id}`
            );

            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to get task details";
            throw new Error(message);
        }
    }

    async downloadTaskFile(task_id: string, filename: string) {
        try {
            const response = await axios.get(
                `${this.api_url}/download/${task_id}/${filename}`,
                { responseType: 'arraybuffer' }
            );

            return response.data;
        } catch (error) {
            throw new Error("Failed to download file");
        }
    }
}

export default TaskRunnerService;