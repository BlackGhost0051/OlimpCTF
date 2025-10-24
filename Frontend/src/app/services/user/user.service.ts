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

  getUserProfile(login?: string): Observable<UserProfile> {
    if (login) {
      return this.http.get<UserProfile>(`${this.url}/user/profile/${login}`);
    }
    return this.http.get<UserProfile>(`${this.url}/user/profile`);
  }

  updatePrivacy(isPrivate: boolean): Observable<any> {
    return this.http.patch(`${this.url}/user/privacy`, { isPrivate });
  }
}
