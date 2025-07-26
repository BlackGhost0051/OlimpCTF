import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TaskComponent} from '../task/task.component';
import {ChallengeService} from '../../services/challenge/challenge.service';

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

  constructor(private challengeService: ChallengeService,
              private route: ActivatedRoute) {}


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryName = params['name'];
    });
  }
}
