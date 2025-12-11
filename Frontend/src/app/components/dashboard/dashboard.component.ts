import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user/user.service'
import LeaderboardEntry from '../../models/leaderboardEntry'

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);



@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  leaderboard: LeaderboardEntry[] = [];
  loading: boolean = true;
  error: string | null = null;
  private chart?: Chart;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  ngAfterViewInit(): void {
    if (this.leaderboard.length > 0) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadLeaderboard(): void {
    this.loading = true;
    this.error = null;

    this.userService.getLeaderboard(100).subscribe({
      next: (data) => {
        this.leaderboard = data;
        this.loading = false;

        setTimeout(() => this.createChart(), 0);
      },
      error: (err) => {
        console.error('Error loading leaderboard:', err);
        this.error = 'Failed to load leaderboard. Please try again later.';
        this.loading = false;
      }
    });
  }

  private createChart(): void {
    if (!this.chartCanvas || this.leaderboard.length === 0) {
      return;
    }

    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const topUsers = this.leaderboard.slice(0, 20);
    const labels = topUsers.map(user => user.login);
    const points = topUsers.map(user => user.totalPoints);

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 213, 166, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 213, 166, 0.2)');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Points',
          data: points,
          backgroundColor: gradient,
          borderColor: '#00d5a6',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#afafaf',
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 213, 166, 0.1)'
            },
            border: {
              display: false
            }
          },
          x: {
            ticks: {
              color: '#ffffff',
              font: {
                size: 10,
                weight: 'bold'
              },
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              display: false
            },
            border: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(10, 10, 10, 0.95)',
            titleColor: '#00d5a6',
            bodyColor: '#ffffff',
            borderColor: '#00d5a6',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                const user = topUsers[index];
                return `#${user.rank} ${this.getDisplayName(user)}`;
              },
              label: (context) => {
                const index = context.dataIndex;
                const user = topUsers[index];
                return [
                  `Points: ${user.totalPoints}`,
                  `Completed Tasks: ${user.completedTasks}`
                ];
              }
            }
          }
        }
      }
    });
  }

  getDisplayName(user: LeaderboardEntry): string {
    if (user.name && user.lastname) {
      return `${user.name} ${user.lastname}`;
    }
    return user.login;
  }

  getMedalEmoji(rank: number): string {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }
}
