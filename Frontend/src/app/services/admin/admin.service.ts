import {Inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {response} from 'express';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private url = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient,
              private authService: AuthService) {}

  // TODO: verify
  getUsers() {
    const token = this.authService.getToken();
    return this.http.get(this.url + '/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).subscribe({
      next: response => {
        console.log(response);
      },
      error: error => {
        console.log(error);
      }
    });
  }

  // TODO: verify
  addTask(){
    const token = this.authService.getToken();
    return this.http.post(this.url + '/task', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).subscribe({
      next: response => {
        console.log(response);
      },
      error: error => {
        console.log(error);
      }
    });
  }

  // TODO: verify
  modTask(){
    const token = this.authService.getToken();
    return this.http.patch(this.url + '/task', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).subscribe({
      next: response => {
        console.log(response);
      },
      error: error => {
        console.log(error);
      }
    });
  }

  // TODO: verify
  deleteTask(){
    const token = this.authService.getToken();
    return this.http.delete(this.url + '/task', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).subscribe({
      next: response => {
        console.log(response);
      },
      error: error => {
        console.log(error);
      }
    });
  }

  isAdmin(): Observable<boolean> {
    const token = this.authService.getToken();

    return this.http.post<{ status: boolean }>(this.url, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).pipe(
      map(response => response.status),
      catchError(err => of(false))
    );
  }
}
