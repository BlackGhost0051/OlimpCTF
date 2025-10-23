import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Task} from '../../models/task';

@Component({
  selector: 'app-task',
  imports: [],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent{
  @Input() task!: Task;
  @Output() taskClick = new EventEmitter<Task>();

  constructor() {}

  onTaskClick() {
    this.taskClick.emit(this.task);
  }
}
