import {Injectable, Input} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor() { }

  verifyFlag(id: string, flag:string){
    return true;
  }

  getCategories(){

  }
}
