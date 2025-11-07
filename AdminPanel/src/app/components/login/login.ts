import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environmen'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    FloatLabelModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  errorMessage?: string;

  constructor(
    public adminService: AdminService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'All fields are required';
      return;
    }

    const login_info = {
      login: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    return this.adminService.login(login_info).subscribe({
      next: (result) => {
        if (!result) {
          this.errorMessage = "Login failed";
        } else {
          this.loginForm.reset();
          this.router.navigate(['/' + environment.routes.admin]);
        }
      },
      error: (error) => {
        this.errorMessage = error?.error?.message;
      }
    });
  }
}
