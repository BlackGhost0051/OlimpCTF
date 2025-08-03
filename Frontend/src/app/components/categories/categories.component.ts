import {Component, OnInit} from '@angular/core';
import { Router,RouterLink } from '@angular/router';
import {ChallengeService} from '../../services/challenge/challenge.service';

@Component({
  selector: 'app-categories',
  imports: [ RouterLink ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit{

  categories: any;

  constructor(private challengeService: ChallengeService) {}

  ngOnInit() {
     this.challengeService.getCategories().subscribe((response: any) => {
       this.categories = response.categories;
       console.log(response.categories);
    });
  }
}
