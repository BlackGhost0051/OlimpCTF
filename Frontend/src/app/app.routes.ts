import { Routes } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {WelcomeComponent} from './components/welcome/welcome.component';
import {ProfileComponent} from './components/profile/profile.component';
import {CategoriesComponent} from './components/categories/categories.component';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {WebComponent} from './components/categories/web/web.component';
import {OsintComponent} from './components/categories/osint/osint.component';
import {CryptographyComponent} from './components/categories/cryptography/cryptography.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'categories', component: CategoriesComponent },

  { path: 'categories/web', component: WebComponent },
  { path: 'categories/osint', component: OsintComponent },
  { path: 'categories/cryptography', component: CryptographyComponent}
];
