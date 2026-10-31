import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from './sesion';

/**
 * Bloquea las pantallas internas cuando no hay sesión, como hacía
 * auth-guard.js en las páginas HTML.
 *
 * Destino provisional: la portada pública. Cuando exista la ruta /login
 * de Nohelia, cambiar DESTINO_SIN_SESION por '/login' y pasarle la URL de
 * vuelta en queryParams. Es el único punto a tocar.
 */
const DESTINO_SIN_SESION = '/';

export const sesionGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  if (sesion.recargar()) return true;
  return router.createUrlTree([DESTINO_SIN_SESION]);
};
