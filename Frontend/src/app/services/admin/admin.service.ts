import {Inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {response} from 'express';
import {AuthService} from '../auth/auth.service';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private url = environment.apiUrl + '/admin';

  constructor(private http: HttpClient,
              private authService: AuthService) {}

  // TODO: verify
  getUsers() {
    return this.http.get(this.url + '/users').subscribe({
      next: response => {
        console.log(response);
      },
      error: error => {
        console.log(error);
      }
    });
  }

  // TODO: verify
  addTask(task: any, flag: string){
    return this.http.post(this.url + '/task', {task:task, flag:flag});
  }

  // TODO: verify
  modTask(){
    return this.http.patch(this.url + '/task', {}).subscribe({
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
    return this.http.delete(this.url + '/task').subscribe({
      next: response => {
        console.log(response);
      },
      error: error => {
        console.log(error);
      }
    });
  }

  isAdmin(): Observable<boolean> {
    return this.http.post<{ status: boolean }>(this.url, {}).pipe(
      map(response => response.status),
      catchError(err => of(false))
    );
  }
}
