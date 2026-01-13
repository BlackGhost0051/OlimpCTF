import {DOCUMENT, Inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environmen';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {Token} from '../models/token';
import {UsersResponse} from '../models/user';
import {Task, TasksResponse, TaskRequest} from '../models/task';
import {Category} from '../models/category';

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

  uploadTaskZip(task: Task, flag: string, zipFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('task', JSON.stringify(task));
    formData.append('flag', flag);
    formData.append('task_zip', zipFile);

    return this.http.post(this.url + '/upload_task', formData).pipe(
      catchError(error => {
        console.error('Error uploading task ZIP:', error);
        throw error;
      })
    );
  }

  updateTask(taskId: string, updates: Partial<Task>): Observable<any> {
    return this.http.put(this.url + '/task', { task_id: taskId, updates: updates }).pipe(
      catchError(error => {
        console.error('Error updating task:', error);
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


  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url + '/categories');
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.url + '/categories', category);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(this.url + '/categories/' + id, category);
  }

  getLogs(lines: number = 100): Observable<any> {
    let params = new HttpParams().set('lines', lines.toString());

    return this.http.get<any>(this.url + '/logs', { params }).pipe(
      catchError(error => {
        console.error('Error fetching logs:', error);
        throw error;
      })
    );
  }
}
