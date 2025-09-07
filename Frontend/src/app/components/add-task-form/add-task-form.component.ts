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
  flagPrefix: string = 'olimpCTF{';
  flagSuffix: string = '}';


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

  addRandomToFlag(){
    const pattern = /_\d{6}_\d{6}$/;
    const random1 = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    const random2 = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');


    if(pattern.test(this.flag)){
      this.flag = this.flag.slice(0, -14);
      this.flag = this.flag + "_" + random1 + "_" + random2;
    } else {
      this.flag = this.flag + "_" + random1 + "_" + random2;
    }
  }

  addTaskToggled(){
    const completeFlag = this.flagPrefix + this.flag + this.flagSuffix;
    this.adminService.addTask(this.task, completeFlag);
  }
}
