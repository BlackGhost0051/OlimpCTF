import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AdminService} from './admin.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  const isAdmin = await adminService.isAdmin().toPromise();

  if (isAdmin) {
    return true;
  } else {
    return router.createUrlTree(['/']);
  }
};
