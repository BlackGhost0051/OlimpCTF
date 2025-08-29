import {Inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {DOCUMENT} from '@angular/common';
import {response} from 'express';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private url = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {}

  // TODO: verify
  getUsers() {
    const localStorage = this.document.defaultView?.localStorage;
    const token = localStorage?.getItem('token');
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
    const localStorage = this.document.defaultView?.localStorage;
    const token = localStorage?.getItem('token');
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

  isAdmin(): Observable<boolean> {
    const localStorage = this.document.defaultView?.localStorage;
    const token = localStorage?.getItem('token');

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
