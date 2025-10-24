import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  changeName(){}

  changePassword() {}

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.url}/user/profile`);
  }
}
