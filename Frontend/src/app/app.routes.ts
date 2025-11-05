import { Routes } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {WelcomeComponent} from './components/welcome/welcome.component';
import {ProfileComponent} from './components/profile/profile.component';
import {CategoriesComponent} from './components/categories/categories.component';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {MainComponent} from './components/main/main.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';


import { authGuard } from './services/auth/auth.guard';
import {CategoryViewComponent} from './components/category-view/category-view.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'dashboard', component: DashboardComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'profile/:login', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [authGuard] },
  { path: 'category/:id', component: CategoryViewComponent, canActivate: [authGuard] },
];
