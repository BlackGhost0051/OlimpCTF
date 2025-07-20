import { Component } from '@angular/core';
import { Router,RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories',
  imports: [ RouterLink ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {

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
