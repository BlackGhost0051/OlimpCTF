import {DOCUMENT, Inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environmen';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {Token} from '../models/token';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  private url = environment.apiUrl + 'admin';

  constructor(private http: HttpClient,
              @Inject(DOCUMENT) private document: Document) {

  }

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
  addTask(task: any, flag: string, zipFile: File | null = null){
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

  login(login_info: any){
    const localStorage = this.document.defaultView?.localStorage;
    return this.http.post(this.url + '/user/login', {
      login: login_info.login,
      password: login_info.password
    }).pipe(
      map((result: Token | any) => {
        if (result && result.token) {
          localStorage?.setItem('token', result.token);
          return true;
        }
        return false;
      })
    );
  }

  isAdmin(): Observable<boolean> {
    return this.http.post<{ status: boolean }>(this.url, {}).pipe(
      map(response => response.status),
      catchError(err => of(false))
    );
  }
}
