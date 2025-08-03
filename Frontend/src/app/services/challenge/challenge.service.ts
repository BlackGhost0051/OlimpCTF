import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Task } from '../../models/task';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {

  private url = 'http://localhost:5000/api/challenge';


  constructor(private http: HttpClient) { }

  // need verify user || user_id
  verifyFlag(id: string, flag:string){
    return this.http.post(this.url + '/user/register', { id:id, flag:flag});
  }

  // getCategories(){
  //   return [
  //     {
  //       id: 1,
  //       name: "WEB",
  //       url: "web",
  //       icon: ""
  //     },
  //     {
  //       id: 2,
  //       name: "OSINT",
  //       url: "osint",
  //       icon: ""
  //     },
  //     {
  //       id: 3,
  //       name: "Cryptography",
  //       url: "cryptography",
  //       icon: ""
  //     },
  //   ]
  // }

  getCategoryTasks(category: string){
    return this.http.post(this.url + '/category_tasks', { category: category });
  }

  getCategories(){
    return this.http.post(this.url + '/categories', {});
  } 
}
