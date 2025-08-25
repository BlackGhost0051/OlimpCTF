import fetch from "node-fetch";

class TaskRunnerService{
    api_url: string = "http://task-runner:5001/api/challenge";

    async addTask(id: string, flag:string){
        const response = await fetch(this.api_url + '/task', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                task_id: id,
                flag: flag,
            }),
        });

        if (!response.ok){
            throw new Error("Failed to create task");
        }
        return await response.json();
    }

    async deleteTask(task_id: string){
        const response = await fetch(this.api_url + '/task', {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                task_id: task_id,
            }),
        });
    }

    async verifyFlag(id: string, flag:string){
        const response = await fetch(this.api_url + '/verify_flag', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               task_id: id,
               flag: flag,
            }),
        });

        if (!response.ok){
            console.log(response.body);
            throw new Error("Failed to verify task");
        }

        // TODO: verify logic
        const data = await response.json() as { status: boolean };
        return data.status;
    }
}

export default TaskRunnerService;