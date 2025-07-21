import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TaskComponent} from '../task/task.component';
import {TaskService} from '../../services/task/task.service';

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

  constructor(private taskService: TaskService,
              private route: ActivatedRoute) {}


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryName = params['name'];
    });
  }
}
