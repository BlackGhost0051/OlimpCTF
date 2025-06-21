import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {JwtHelperService} from "@auth0/angular-jwt";
import {DOCUMENT} from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private url = 'http://backend:5000/api';

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {}

  login(){

  }

  register(){

  }

  logout(){

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
