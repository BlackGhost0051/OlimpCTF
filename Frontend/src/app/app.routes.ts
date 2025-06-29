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
import {MainComponent} from './components/main/main.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';

import { authGuard } from './services/auth/auth.guard';


export const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'home', component: HomeComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'dashboard', component: DashboardComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'categories', component: CategoriesComponent },

  { path: 'categories/web', component: WebComponent, canActivate: [authGuard] },
  { path: 'categories/osint', component: OsintComponent, canActivate: [authGuard] },
  { path: 'categories/cryptography', component: CryptographyComponent, canActivate: [authGuard]}
];
