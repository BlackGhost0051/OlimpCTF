import { Component } from '@angular/core';

@Component({
  selector: 'app-fake-maintenance',
  imports: [],
  templateUrl: './fake-maintenance.html',
  styleUrl: './fake-maintenance.scss',
})
export class FakeMaintenance {
  errorId: string;
  timestamp: string;

  constructor() {
    this.errorId = this.generateErrorId();
    this.timestamp = new Date().toISOString();
  }

  private generateErrorId(): string {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  }
}
