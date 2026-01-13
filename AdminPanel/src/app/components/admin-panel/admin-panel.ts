import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardView } from '../dashboard-view/dashboard-view';
import { UsersView } from '../users-view/users-view';
import { TasksView } from '../tasks-view/tasks-view';
import { CategoriesView } from '../categories-view/categories-view';
import { LogsView } from '../logs-view/logs-view';
import { AdminService } from '../../services/admin';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    MenuModule,
    ButtonModule,
    DashboardView,
    UsersView,
    TasksView,
    CategoriesView,
    LogsView
  ],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanel {
  currentView: string = 'users';

  menuItems: MenuItem[] = [
    // {
    //   label: 'Dashboard',
    //   command: () => this.selectView('dashboard')
    // },
    {
      label: 'Users',
      command: () => this.selectView('users')
    },
    {
      label: 'Tasks',
      command: () => this.selectView('tasks')
    },
    {
      label: 'Categories',
      command: () => this.selectView('categories')
    },
    {
      label: 'Logs',
      command: () => this.selectView('logs')
    }
  ];

  constructor(private adminService: AdminService) {}

  selectView(view: string) {
    this.currentView = view;
  }

  logout() {
    this.adminService.logout();
    window.location.href = '/';
  }
}
