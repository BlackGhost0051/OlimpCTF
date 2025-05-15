import { Component } from '@angular/core';
import {HomeHeaderComponent} from './home-header/home-header.component';
import {HomeFooterComponent} from './home-footer/home-footer.component';


@Component({
  selector: 'app-home',
  imports: [HomeHeaderComponent, HomeFooterComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
