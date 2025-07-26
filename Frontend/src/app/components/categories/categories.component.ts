import {Component, OnInit} from '@angular/core';
import { Router,RouterLink } from '@angular/router';
import {ChallengeService} from '../../services/challenge/challenge.service';

@Component({
  selector: 'app-categories',
  imports: [ RouterLink ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit{

  categories: any;

  constructor(private challengeService: ChallengeService) {}

  ngOnInit() {
    this.categories = this.challengeService.getCategories();
  }
}
