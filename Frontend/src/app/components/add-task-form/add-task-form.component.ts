import {Component, Output, EventEmitter, Input, OnInit} from '@angular/core';
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
export class AddTaskFormComponent implements OnInit{
  @Output() close = new EventEmitter<any>();
  @Input() inputTask: any;

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

  ngOnInit() {
    if (this.inputTask) {
      this.enterEditMode();
    }
  }

  private enterEditMode(){
    this.isEdit = true;
    this.title = 'Edit Task';
    this.task = { ...this.inputTask };
  }

  addTaskToggled(){
    this.adminService.addTask(this.task, this.flag);
  }
}
