import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional route guard that checks the current user's role
 * against a list of allowed roles defined in route data.
 *
 * Usage in routes:
 *   { path: 'doctors', component: ..., canActivate: [roleGuard], data: { allowedRoles: ['admin'] } }
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data?.['allowedRoles'] ?? [];
  const user = authService.getCurrentUser();

  // If no roles specified, allow everyone
  if (allowedRoles.length === 0) {
    return true;
  }

  if (user && allowedRoles.includes(user.role)) {
    return true;
  }

  // Unauthorized — redirect to login if not authenticated, otherwise dashboard home
  if (!user) {
    return router.createUrlTree(['/login']);
  }
  return router.createUrlTree(['/dashboard']);
};
