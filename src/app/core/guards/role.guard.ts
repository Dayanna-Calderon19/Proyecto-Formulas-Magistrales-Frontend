import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional que verifica que el usuario autenticado posea al menos uno
 * de los roles definidos en route.data['roles'].
 * Si el usuario no tiene los privilegios requeridos, se redirige al /dashboard.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data?.['roles'] || [];

  // Si la ruta no especifica roles requeridos, se permite el acceso si está autenticado
  if (requiredRoles.length === 0) {
    return true;
  }

  // Comprobar si el usuario tiene alguno de los roles requeridos
  const hasRequiredRole = requiredRoles.some(role => auth.hasRole(role));

  if (hasRequiredRole) {
    return true;
  }

  // Usuario autenticado pero sin privilegios suficientes
  router.navigate(['/dashboard'], {
    queryParams: { accessDenied: 'true', required: requiredRoles.join(',') }
  });
  return false;
};
