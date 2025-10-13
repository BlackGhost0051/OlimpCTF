import { Component } from '@angular/core';
import { AddTaskFormComponent } from '../add-task-form/add-task-form.component';

@Component({
  selector: 'app-admin',
  imports: [ AddTaskFormComponent ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  showUsers = false;
  showTasks = false;
}
