import { Component } from '@angular/core';
import {FooterComponent} from '../global/footer/footer.component';


@Component({
  selector: 'app-home',
  imports: [FooterComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
