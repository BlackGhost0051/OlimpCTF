import {Component, Input} from '@angular/core';
import {Task} from '../../models/task';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-task',
  imports: [
    FormsModule
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent{
  @Input() task: Task;

  flagInput= "";

  constructor() {
  }
}
