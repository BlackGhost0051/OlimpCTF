import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-categories-view',
  standalone: true,
  imports: [CardModule],
  templateUrl: './categories-view.html',
  styleUrl: './categories-view.scss',
})
export class CategoriesView {

}
