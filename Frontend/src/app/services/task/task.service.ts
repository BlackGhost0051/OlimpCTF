import {Injectable, Input} from '@angular/core';
import {Task} from '../../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  @Input() task!: Task;

  constructor() { }
}
