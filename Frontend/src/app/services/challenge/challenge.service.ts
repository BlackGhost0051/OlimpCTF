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
    return this.http.post(this.url + '/verify_flag', { task_id:id, flag:flag});
  }

  // TODO: verify internet connection
  // TODO: verify if server is running

  getCategoryTasks(category: string){
    return this.http.post(this.url + '/category_tasks', { category: category });
  }

  getCategory(id: string){
    return this.http.post(this.url + '/category', { id: id });
  }

  getCategories(){
    return this.http.post(this.url + '/categories', {});
  }
}
