import {Component, Input, OnChanges, OnDestroy, SimpleChanges, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CategoryStatistics} from '../../models/user';
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-statistics-radar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics-radar-chart.component.html',
  styleUrl: './statistics-radar-chart.component.scss'
})
export class StatisticsRadarChartComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() statistics?: CategoryStatistics[];
  @ViewChild('radarCanvas') radarCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  ngAfterViewInit() {
    if (this.statistics && this.statistics.length > 0) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['statistics'] && !changes['statistics'].firstChange) {
      this.updateChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart() {
    if (!this.radarCanvas || !this.statistics || this.statistics.length === 0) {
      return;
    }

    const canvas = this.radarCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    // Prepare data for the chart - ensure all values are numbers
    const labels = this.statistics.map(stat => stat.category);
    const completedTasks = this.statistics.map(stat => Number(stat.completed_tasks));
    const totalTasks = this.statistics.map(stat => Number(stat.total_tasks));
    const points = this.statistics.map(stat => Number(stat.total_points));

    // Calculate completion percentage for each category
    const completionPercentage = this.statistics.map(stat => {
      const total = Number(stat.total_tasks);
      const completed = Number(stat.completed_tasks);
      return total > 0 ? (completed / total) * 100 : 0;
    });

    this.chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Completion %',
            data: completionPercentage,
            backgroundColor: 'rgba(0, 213, 166, 0.2)',
            borderColor: 'rgba(0, 213, 166, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(0, 213, 166, 1)',
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: 'rgba(0, 213, 166, 1)'
          },
          {
            label: 'Points Earned',
            data: points,
            backgroundColor: 'rgba(51, 255, 0, 0.2)',
            borderColor: 'rgba(51, 255, 0, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(51, 255, 0, 1)',
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: 'rgba(51, 255, 0, 1)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              stepSize: 20,
              color: '#afafaf',
              backdropColor: 'transparent'
            },
            grid: {
              color: 'rgba(0, 213, 166, 0.1)'
            },
            pointLabels: {
              color: '#ffffff',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ffffff',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(10, 10, 10, 0.9)',
            titleColor: '#00d5a6',
            bodyColor: '#ffffff',
            borderColor: 'rgba(0, 213, 166, 0.5)',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const datasetLabel = context.dataset.label || '';
                const value = context.parsed.r;

                if (datasetLabel === 'Completion %') {
                  const statIndex = context.dataIndex;
                  const stat = this.statistics![statIndex];
                  return [
                    `${datasetLabel}: ${value.toFixed(1)}%`,
                    `Completed: ${stat.completed_tasks}/${stat.total_tasks} tasks`
                  ];
                } else {
                  return `${datasetLabel}: ${value}`;
                }
              }
            }
          }
        }
      }
    });
  }

  private updateChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.createChart();
  }

  get hasStatistics(): boolean {
    return !!this.statistics && this.statistics.length > 0;
  }

  get totalPoints(): number {
    if (!this.statistics) return 0;
    return this.statistics.reduce((sum, stat) => sum + Number(stat.total_points), 0);
  }

  get totalCompletedTasks(): number {
    if (!this.statistics) return 0;
    return this.statistics.reduce((sum, stat) => sum + Number(stat.completed_tasks), 0);
  }

  get totalTasks(): number {
    if (!this.statistics) return 0;
    return this.statistics.reduce((sum, stat) => sum + Number(stat.total_tasks), 0);
  }

  get overallCompletionPercentage(): number {
    if (!this.statistics || this.totalTasks === 0) return 0;
    return (this.totalCompletedTasks / this.totalTasks) * 100;
  }
}
