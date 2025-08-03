import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TaskComponent} from '../task/task.component';
import {ChallengeService} from '../../services/challenge/challenge.service';
import {Task} from '../../models/task';

@Component({
  selector: 'app-category',
  imports: [
    TaskComponent,
    // TaskComponent
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit{
  categoryName: string = '';
  clickedTask!: Task;
  showTask = false;

  tasks: Task[] = [];

  constructor(private challengeService: ChallengeService,
              private route: ActivatedRoute) {}


  ngOnInit() {
    // let categories = this.challengeService.getCategories();
    //
    this.route.params.subscribe(params => {
      this.categoryName = params['name'];
    //   const category = categories.find(category => category.url === this.categoryName);
    //
    //   if (category) {
    //     this.categoryExists = true;
        this.getCategoryTasks(this.categoryName).subscribe((response: any) => {
          this.tasks = response.tasks;
          console.log(response);
        });
    //   }
    });
  }

  getCategoryTasks(category: string){
    return this.challengeService.getCategoryTasks(category);
  }

  onTaskClick(task: Task){
    this.clickedTask = task;
    this.showTask = true;
  }
  onTaskClose(){
    this.showTask = false;
  }
}
