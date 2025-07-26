import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {

  private url = 'http://localhost:5001/';


  constructor(private http: HttpClient) { }

  // need verify user || user_id
  verifyFlag(id: string, flag:string){
    return this.http.post(this.url + '/user/register', { id:id, flag:flag});
  }

  getCategories(){

  }
}
