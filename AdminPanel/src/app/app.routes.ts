import { Routes } from '@angular/router';

import {Login} from './components/login/login';
import {AdminPanel} from './components/admin-panel/admin-panel';

import {adminGuard} from './services/admin-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', component: AdminPanel, canActivate: [adminGuard]}
];
