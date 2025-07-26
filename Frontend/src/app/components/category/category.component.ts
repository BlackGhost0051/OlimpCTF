import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TaskComponent} from '../task/task.component';
import {ChallengeService} from '../../services/challenge/challenge.service';
import {Task} from '../../models/task';

@Component({
  selector: 'app-category',
  imports: [
    TaskComponent
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit{
  categoryName: string = '';

  tasks: Task[] = [];

  constructor(private challengeService: ChallengeService,
              private route: ActivatedRoute) {}


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryName = params['name'];

      if(this.categoryName == "web"){
        this.categoryName = "WEB";
      }
      if(this.categoryName == "osint"){
        this.categoryName = "OSINT";
      }

      this.tasks = this.getCategoryTasks(this.categoryName); // Call the method to get tasks
    });
  }

  getCategoryTasks(category: string){
    return this.challengeService.getCategoryTasks(category);
  }
}
