import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AdminService} from './admin.service';

// TODO: remove admin logic
export const adminGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  return router.createUrlTree(['/']);
};
