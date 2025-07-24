import {Component, OnInit} from '@angular/core';
import { Router,RouterLink } from '@angular/router';
import {TaskService} from '../../services/task/task.service';

@Component({
  selector: 'app-categories',
  imports: [ RouterLink ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit{

  private categories: any[];

  constructor(private taskService: TaskService) {
  }

  ngOnInit() {
    this.taskService.getCategories();
  }

  categories = [
    {
      id: 1,
      name: "WEB",
      url: "web",
      icon: ""
    },
    {
      id: 2,
      name: "OSINT",
      url: "osint",
      icon: ""
    },
    {
      id: 3,
      name: "Cryptography",
      url: "cryptography",
      icon: ""
    },
  ]
}
