import { Routes } from '@angular/router';

import {Login} from './components/login/login';
import {AdminPanel} from './components/admin-panel/admin-panel';
import {FakeMaintenance} from './components/fake-maintenance/fake-maintenance';

import {adminGuard} from './services/admin-guard';


// TODO: NEED FIX ALL GO TO FakeMaintenance
export const routes: Routes = [
  { path: '**', component: FakeMaintenance },
  { path: 'auth_system_MB4IA61PEE9', component: Login },
  { path: 'admin_console_MB4IA61PEE9', component: AdminPanel, canActivate: [adminGuard]},
  { path: '**', component: FakeMaintenance },
];
