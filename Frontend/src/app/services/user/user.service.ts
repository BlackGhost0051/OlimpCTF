import {Inject, Injectable} from '@angular/core';
import {map} from 'rxjs';
import {Token} from '../../models/token';
import {HttpClient} from '@angular/common/http';
import {DOCUMENT} from '@angular/common';
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})

export class UserService {

  private url = 'http://backend:5000/api';

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {}

  login(login_info: any){
    const localStorage = this.document.defaultView?.localStorage;
    return this.http.post(this.url + '/user/auth', {
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
}
