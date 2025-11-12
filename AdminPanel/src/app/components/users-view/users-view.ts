import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AdminService } from '../../services/admin';
import { User, UsersResponse, PaginationInfo } from '../../models/user';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-users-view',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, TableModule, PaginatorModule, TagModule, ButtonModule, InputTextModule],
  templateUrl: './users-view.html',
  styleUrl: './users-view.scss',
})
export class UsersView implements OnInit {
  users: User[] = [];
  loading = false;
  searchTerm = '';
  pagination: PaginationInfo = {
    currentPage: 1,
    totalPages: 0,
    totalUsers: 0,
    limit: 10
  };

  private searchSubject = new Subject<string>();

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.loadUsers(1, this.pagination.limit, searchTerm);
    });
  }

  loadUsers(page: number = 1, limit: number = 10, search: string = '') {
    this.loading = true;
    this.adminService.getUsers(page, limit, search).subscribe({
      next: (response: UsersResponse) => {
        this.users = response.users;
        this.pagination = {
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalUsers: response.totalUsers,
          limit: response.limit
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.loadUsers(event.page + 1, event.rows, this.searchTerm);
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.loadUsers(1, this.pagination.limit, '');
  }

  getSeverity(isAdmin: boolean): "success" | "secondary" {
    return isAdmin ? 'success' : 'secondary';
  }

  getPrivacySeverity(isPrivate: boolean): "warn" | "info" {
    return isPrivate ? 'warn' : 'info';
  }
}
