import {DOCUMENT, Inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environmen';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {Token} from '../models/token';
import {UsersResponse} from '../models/user';
import {Task, TasksResponse, TaskRequest} from '../models/task';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  private url = environment.apiUrl + '/admin';

  constructor(private http: HttpClient,
              @Inject(DOCUMENT) private document: Document) {

  }

  getUsers(page: number = 1, limit: number = 10, search: string = ''): Observable<UsersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<UsersResponse>(this.url + '/users', { params }).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        throw error;
      })
    );
  }

  getAllTasks(): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(this.url + '/tasks').pipe(
      catchError(error => {
        console.error('Error fetching tasks:', error);
        throw error;
      })
    );
  }

  addTask(task: Task, flag: string): Observable<any> {
    return this.http.post(this.url + '/task', {task: task, flag: flag}).pipe(
      catchError(error => {
        console.error('Error adding task:', error);
        throw error;
      })
    );
  }

  deleteTask(taskId: string): Observable<any> {
    return this.http.delete(this.url + '/task', { body: { task_id: taskId } }).pipe(
      catchError(error => {
        console.error('Error deleting task:', error);
        throw error;
      })
    );
  }

  login(login_info: any){
    const localStorage = this.document.defaultView?.localStorage;
    return this.http.post(this.url + '/login', {
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

  logout(){
    this.document.defaultView?.localStorage?.removeItem('token');
  }

  getToken() {
    const localStorage = this.document.defaultView?.localStorage;
    return localStorage?.getItem('token');
  }

  isAdmin(): Observable<boolean> {
    return this.http.post<{ status: boolean }>(this.url, {}).pipe(
      map(response => response.status),
      catchError(err => of(false))
    );
  }
}
