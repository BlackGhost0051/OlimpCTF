import {Component, OnInit} from '@angular/core';
import {ChallengeService} from '../../services/challenge/challenge.service';
import {CategoryComponent} from '../category/category.component';

@Component({
  selector: 'app-categories',
  imports: [ CategoryComponent ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit{

  categories: any;

  constructor(private challengeService: ChallengeService) {}

  ngOnInit() {
     this.challengeService.getCategories().subscribe((response: any) => {
       this.categories = response.categories;
    });
  }
}
