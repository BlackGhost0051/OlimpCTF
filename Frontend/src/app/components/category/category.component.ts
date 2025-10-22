import {Component, Input, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {Category} from '../../models/category';

@Component({
  selector: 'app-category',
  imports: [
    RouterLink
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit{
  @Input() category?: Category;


  ngOnInit() {
    console.log(this.category);
  }

}
