import { Component } from '@angular/core';
import { Router , RouterLink} from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  errorMessage: string = "";

}
