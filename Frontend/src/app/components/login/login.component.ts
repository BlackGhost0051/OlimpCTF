import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {

  public login_info = {
    login: '',
    password: ''
  }

  public logged?: boolean;
  public logout?: boolean;
  public errorMessage?: string;


  constructor(public authService: AuthService, private router: Router) {}


  login(){
    this.errorMessage = undefined;

    if (!this.login_info.login || !this.login_info.password) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (this.login_info.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    return this.authService.login(this.login_info).subscribe((result) => {
      if (!result){
        this.logged = false;
      } else {
        this.logout = false;

        this.login_info = {
          login: '',
          password: ''
        };
        this.router.navigate(['/']);
      }
    },
      (error) => {
        this.errorMessage = 'Login or password is incorrect.';
      }
      );
  }
}
