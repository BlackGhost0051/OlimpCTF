import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ChallengeService} from '../../services/challenge/challenge.service';
import {Task} from '../../models/task';
import {Category} from '../../models/category';
import {TaskViewComponent} from '../task-view/task-view.component';
import {TaskComponent} from '../task/task.component';

@Component({
  selector: 'app-category-view',
  imports: [
    TaskViewComponent,
    TaskComponent,
  ],
  templateUrl: './category-view.component.html',
  styleUrl: './category-view.component.scss'
})
export class CategoryViewComponent implements OnInit{
  category!: Category;
  clickedTask!: Task;
  showTaskView = false;

  tasks: Task[] = [];

  constructor(private challengeService: ChallengeService,
              private route: ActivatedRoute,
              private router: Router) {}


  ngOnInit() {
    this.route.params.subscribe(params => {
      const categoryNicename = params['id'];

      this.challengeService.getCategory(categoryNicename).subscribe((response: any) => {
          this.category = response.category;
        },
        (error) => {
          this.router.navigate(['/categories']);
        }
      );

      this.getCategoryTasks(categoryNicename).subscribe((response: any) => {
          this.tasks = response.tasks;
        },
        (error) => {
          this.router.navigate(['/categories']);
        }
      );
    });
  }

  getCategoryTasks(category: string){
    return this.challengeService.getCategoryTasks(category);
  }

  onTaskClick(task: Task){
    this.clickedTask = task;
    this.showTaskView = true;
  }
  onTaskClose(){
    this.showTaskView = false;
  }
}
