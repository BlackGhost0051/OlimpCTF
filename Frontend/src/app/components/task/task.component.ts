import {Component, Input} from '@angular/core';
import {Task} from '../../models/task';
import {FormsModule} from '@angular/forms';
import {TaskService} from '../../services/task/task.service';
import {resolve} from 'node:path';

@Component({
  selector: 'app-task',
  imports: [
    FormsModule
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent{
  @Input() task!: Task;

  flagInput= "";

  constructor(private taskService: TaskService) {
  }

  verifyFlag(id: string){
    let result = this.taskService.verifyFlag(id, this.flagInput);
  }
}
