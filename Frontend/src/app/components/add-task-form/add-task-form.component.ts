import {Component, Output, EventEmitter} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


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

  public task = {
    title: '',
    category: '',
    icon: '',
    difficulty: '',
    points: '',
    description: '',
    flag: ''
  }
}
