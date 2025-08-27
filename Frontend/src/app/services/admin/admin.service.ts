import {Inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {DOCUMENT} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private url = 'http://localhost:5000/api';

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {}


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
