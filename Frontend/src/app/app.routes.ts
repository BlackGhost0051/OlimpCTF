import { Routes } from '@angular/router';
import {SigninComponent} from './components/signin/signin.component';
import {SignupComponent} from './components/signup/signup.component';
import {HomeComponent} from './components/home/home.component';
import {WelcomeComponent} from './components/welcome/welcome.component';
import {ProfileComponent} from './components/profile/profile.component';
import {CategoriesComponent} from './components/categories/categories.component';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';


export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  // {
  //   path: 'signIn',
  //   component: SigninComponent,
  // },
  // {
  //   path: 'signUp',
  //   component: SignupComponent,
  // },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'categories',
    component: CategoriesComponent,
  }
];
