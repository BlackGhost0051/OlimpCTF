import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { Task, TasksResponse } from '../../models/task';

@Component({
  selector: 'app-tasks-view',
  standalone: true,
  imports: [
    CardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TagModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './tasks-view.html',
  styleUrl: './tasks-view.scss',
})
export class TasksView implements OnInit {
  tasks: Task[] = [];
  selectedTask: Task | null = null;
  showDialog = false;
  editMode = false;
  loading = false;

  editedTask: Partial<Task> = {
    title: '',
    category: '',
    difficulty: '',
    points: 0,
    description: ''
  };

  flag: string = '';
  flagPrefix: string = 'olimpCTF{';
  flagSuffix: string = '}';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.adminService.getAllTasks().subscribe({
      next: (response: TasksResponse) => {
        if (response.status) {
          this.tasks = response.tasks;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.loading = false;
      }
    });
  }

  editTask(task: Task): void {
    this.selectedTask = task;
    this.editedTask = { ...task };
    this.flag = '';
    this.editMode = true;
    this.showDialog = true;
  }

  showAddDialog(): void {
    this.selectedTask = null;
    this.editedTask = {
      title: '',
      category: '',
      difficulty: '',
      points: 0,
      description: ''
    };
    this.flag = '';
    this.editMode = false;
    this.showDialog = true;
  }

  hideDialog(): void {
    this.showDialog = false;
    this.selectedTask = null;
    this.editedTask = {
      title: '',
      category: '',
      difficulty: '',
      points: 0,
      description: ''
    };
    this.flag = '';
  }

  saveTask(): void {
    const completeFlag = this.flagPrefix + this.flag + this.flagSuffix;

    if (this.editMode && this.selectedTask && this.selectedTask.id) {
      // this.adminService.updateTask(this.selectedTask.id, this.editedTask).subscribe({
      //   next: (data) => {
      //     console.log('Task updated:', data);
      //     this.loadTasks();
      //     this.hideDialog();
      //   },
      //   error: (err) => {
      //     console.error('Error updating task:', err);
      //   }
      // });
      this.hideDialog();
    } else {
      this.adminService.addTask(this.editedTask as Task, completeFlag).subscribe({
        next: (data) => {
          console.log('Task created:', data);
          this.loadTasks();
          this.hideDialog();
        },
        error: (err) => {
          console.error('Error creating task:', err);
        }
      });
    }
  }

  addRandomToFlag(): void {
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

  deleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      if (task.id) {
        this.adminService.deleteTask(task.id).subscribe({
          next: (response) => {
            console.log('Task deleted:', response);
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error deleting task:', err);
          }
        });
      }
    }
  }

  getDifficultyTag(difficulty: string): 'success' | 'warn' | 'danger' {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warn';
      case 'hard': return 'danger';
      default: return 'success';
    }
  }
}
