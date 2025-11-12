import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // FIX loading from URL
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if(authService.isLoggedIn()){
    return true;
  } else {
    authService.setRedirectUrl(state.url);
    return router.createUrlTree(['/login']);
  }
};
