import {Inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {Token} from '../../models/token';
import {HttpClient} from '@angular/common/http';
import {DOCUMENT} from '@angular/common';
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private url = 'http://localhost:5000/api';
  redirectUrl?: string = undefined;

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {}

  setRedirectUrl(url: string){
    this.redirectUrl = url;
  }

  getRedirectUrl(){
    return this.redirectUrl;
  }

  clearRedirectUrl(){
    this.redirectUrl = undefined;
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

  register(register_info: any){
    return this.http.post(this.url + '/user/register', register_info);
  }

  logout(){
    this.document.defaultView?.localStorage?.removeItem('token');
  }

  isLoggedIn(){
    const localStorage = this.document.defaultView?.localStorage;
    const jwtHelper = new JwtHelperService();
    const token = localStorage?.getItem('token');

    if (!token) {
      return false;
    }
    return !(jwtHelper.isTokenExpired(token));
  }

  isAdmin(): Observable<boolean> {
    const localStorage = this.document.defaultView?.localStorage;
    const token = localStorage?.getItem('token');

    return this.http.post<{ status: boolean }>(this.url + '/admin', {}, {
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
