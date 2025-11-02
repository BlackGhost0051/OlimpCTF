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
