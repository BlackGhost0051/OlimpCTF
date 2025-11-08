import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-logs-view',
  standalone: true,
  imports: [CardModule],
  templateUrl: './logs-view.html',
  styleUrl: './logs-view.scss',
})
export class LogsView {

}
