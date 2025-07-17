import { Component } from '@angular/core';
import { Router , RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  public register_info = {
    login: '',
    email: '',
    password: '',
    confirmPassword: ''
  }

  public errorMessage?: string;

  constructor(private authService: AuthService, public router: Router) {}

  register(){
    this.errorMessage = undefined;


    if (!this.register_info.login || !this.register_info.email || !this.register_info.password || !this.register_info.confirmPassword) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (this.register_info.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    if (this.register_info.password !== this.register_info.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }


    this.authService.register({
      login: this.register_info.login,
      email: this.register_info.email,
      password: this.register_info.password
    }).subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      (error) => {
        this.errorMessage = `User with this login already exists.`;
      }
    );

  }

}
