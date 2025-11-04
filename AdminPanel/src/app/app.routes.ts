import { Routes } from '@angular/router';
import { environment } from '../environments/environmen'

import {Login} from './components/login/login';
import {AdminPanel} from './components/admin-panel/admin-panel';
import {FakeMaintenance} from './components/fake-maintenance/fake-maintenance';

import {adminGuard} from './services/admin-guard';


export const routes: Routes = [
  { path: '', component: FakeMaintenance },
  { path: environment.routes.auth, component: Login },
  { path: environment.routes.admin, component: AdminPanel, canActivate: [adminGuard]},
  { path: '**', component: FakeMaintenance },
];
