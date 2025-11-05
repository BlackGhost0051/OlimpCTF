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

}
