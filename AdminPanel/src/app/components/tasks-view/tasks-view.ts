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
    description: '',
    icon: ''
  };

  flag: string = '';
  flagPrefix: string = 'olimpCTF{';
  flagSuffix: string = '}';

  selectedZipFile: File | null = null;
  uploadMode: 'simple' | 'zip' = 'simple';
  iconPreviewUrl: string | null = null;

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
    this.iconPreviewUrl = task.icon || null;
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
      description: '',
      icon: ''
    };
    this.flag = '';
    this.iconPreviewUrl = null;
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
      description: '',
      icon: ''
    };
    this.flag = '';
    this.iconPreviewUrl = null;
    this.selectedZipFile = null;
    this.uploadMode = 'simple';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      this.selectedZipFile = file;
    } else {
      alert('Please select a valid ZIP file');
      this.selectedZipFile = null;
    }
  }

  onIconSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, GIF, SVG)');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.iconPreviewUrl = e.target.result;
        this.editedTask.icon = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveTask(): void {
    const completeFlag = this.flagPrefix + this.flag + this.flagSuffix;

    if (this.editMode && this.selectedTask && this.selectedTask.id) {
      const updates: Partial<Task> = {};

      if (this.editedTask.title !== this.selectedTask.title) {
        updates.title = this.editedTask.title;
      }
      if (this.editedTask.category !== this.selectedTask.category) {
        updates.category = this.editedTask.category;
      }
      if (this.editedTask.difficulty !== this.selectedTask.difficulty) {
        updates.difficulty = this.editedTask.difficulty;
      }
      if (this.editedTask.points !== this.selectedTask.points) {
        updates.points = this.editedTask.points;
      }
      if (this.editedTask.description !== this.selectedTask.description) {
        updates.description = this.editedTask.description;
      }
      if (this.editedTask.icon !== this.selectedTask.icon) {
        updates.icon = this.editedTask.icon;
      }

      // Only send request if there are changes
      if (Object.keys(updates).length === 0) {
        console.log('No changes detected');
        this.hideDialog();
        return;
      }

      this.adminService.updateTask(this.selectedTask.id, updates).subscribe({
        next: (data) => {
          console.log('Task updated:', data);
          this.loadTasks();
          this.hideDialog();
        },
        error: (err) => {
          console.error('Error updating task:', err);
          alert('Error updating task: ' + (err.error?.message || 'Unknown error'));
        }
      });
    } else {
      if (this.uploadMode === 'zip' && this.selectedZipFile) {
        this.adminService.uploadTaskZip(this.editedTask as Task, completeFlag, this.selectedZipFile).subscribe({
          next: (data) => {
            console.log('Task ZIP uploaded:', data);
            alert('Task uploaded successfully! Task ID: ' + data.task_id);
            this.loadTasks();
            this.hideDialog();
          },
          error: (err) => {
            console.error('Error uploading task ZIP:', err);
            alert('Error uploading task: ' + (err.error?.message || 'Unknown error'));
          }
        });
      } else if (this.uploadMode === 'simple') {
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
      } else {
        alert('Please select a ZIP file for ZIP upload mode');
      }
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
