import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-category',
  imports: [],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit{
  categoryName: string = '';

  constructor(private route: ActivatedRoute) {}


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryName = params['name'];
    });
  }
}
