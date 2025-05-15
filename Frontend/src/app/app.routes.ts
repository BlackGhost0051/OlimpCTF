import { Routes } from '@angular/router';
import {SigninComponent} from './components/signin/signin.component';
import {SignupComponent} from './components/signup/signup.component';
import {HomeComponent} from './components/home/home.component';
import {WelcomeComponent} from './components/welcome/welcome.component';


export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'signIn',
    component: SigninComponent,
  },
  {
    path: 'signUp',
    component: SignupComponent,
  }
];
