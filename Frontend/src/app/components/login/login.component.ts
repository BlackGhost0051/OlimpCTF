import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {UserService} from '../../services/user/user.service';

@Component({
  selector: 'app-login',
  imports: [ RouterLink ],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  public login_info = {
    login: '',
    password: ''
  }

  public logged?: boolean;
  public logout?: boolean;
  public errorMessage?: string;


  constructor(public userService: UserService, private router: Router) {}


  login(){
    this.errorMessage = undefined;
    return this.userService.login(this.login_info).subscribe((result) => {
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
