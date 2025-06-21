import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
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
}
