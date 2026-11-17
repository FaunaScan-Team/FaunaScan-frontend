import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../servicios/auth.service';

// Solo deja pasar si hay sesión iniciada (hay token guardado)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.estaLogueado()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

// Solo deja pasar a investigadores y administradores.
// El backend vuelve a validar el rol con @PreAuthorize en cada endpoint.
export const investigadorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.estaLogueado()) {
    return router.createUrlTree(['/login']);
  }
  const rol = authService.rol();
  if (rol === 'ROLE_INVESTIGADOR' || rol === 'ROLE_ADMIN') {
    return true;
  }
  return router.createUrlTree(['/acceso-restringido']);
};
