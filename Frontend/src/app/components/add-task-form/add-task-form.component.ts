import {Component, Output, EventEmitter} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AdminService} from '../../services/admin/admin.service';


@Component({
  selector: 'app-add-task-form',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './add-task-form.component.html',
  styleUrl: './add-task-form.component.scss'
})
export class AddTaskFormComponent {
  @Output() close = new EventEmitter<any>();

  response_msg: string = '';

  isEdit: boolean = false;
  title: string = 'Add Task';

  public task = {
    title: '',
    category: '',
    icon: '',
    difficulty: '',
    points: '',
    description: ''
  }

  public flag: string = '';


  constructor(private adminService: AdminService) {
  }

  addTaskToggled(){
    this.adminService.addTask(this.task, this.flag);
  }
}
