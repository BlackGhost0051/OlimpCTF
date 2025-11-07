import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-tasks-view',
  imports: [CardModule],
  templateUrl: './tasks-view.html',
  styleUrl: './tasks-view.scss',
})
export class TasksView {

}
