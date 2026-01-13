import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-logs-view',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    FormsModule,
    ProgressSpinnerModule,
    MessageModule,
    TableModule,
    TagModule
  ],
  templateUrl: './logs-view.html',
  styleUrl: './logs-view.scss',
})
export class LogsView implements OnInit {
  logs: string[] = [];
  totalLines: number = 0;
  linesToFetch: number = 100;
  loading: boolean = false;
  error: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.error = '';

    this.adminService.getLogs(this.linesToFetch).subscribe({
      next: (response) => {
        this.logs = response.logs || [];
        this.totalLines = response.totalLines || 0;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load logs. Please try again.';
        this.loading = false;
        console.error('Error loading logs:', err);
      }
    });
  }

  refresh(): void {
    this.loadLogs();
  }

  parseLogLine(log: string): { timestamp: string, ip: string, method: string, url: string, userAgent: string } | null {
    const match = log.match(/\[(.*?)\]\s+(\S+)\s+(\S+)\s+(\S+)\s+(.*)/);
    if (match) {
      return {
        timestamp: match[1],
        ip: match[2],
        method: match[3],
        url: match[4],
        userAgent: match[5]
      };
    }
    return null;
  }

  getMethodSeverity(method: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const methodUpper = method.toUpperCase();
    switch (methodUpper) {
      case 'GET':
        return 'success';
      case 'POST':
        return 'info';
      case 'PUT':
      case 'PATCH':
        return 'warn';
      case 'DELETE':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
