import { Component } from '@angular/core';
import {HomeHeaderComponent} from './home-header/home-header.component';
import {FooterComponent} from '../global/footer/footer.component';


@Component({
  selector: 'app-home',
  imports: [HomeHeaderComponent, FooterComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
