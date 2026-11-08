import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionConsultaService } from '../servicios/sesion-consulta.service';

/** Guardias de NAVEGACIÓN del prototipo. El backend deberá validar cada operación. */
export const sesionRequeridaGuard: CanActivateFn = (_ruta, estado) => {
  const usuario = inject(SesionConsultaService).usuarioActual();
  const router = inject(Router);
  if (!usuario) return router.createUrlTree(['/login'], { queryParams: { returnUrl: estado.url } });
  if (usuario.rol === 'investigador' && !usuario.credencialVerificada) {
    return router.createUrlTree(['/verificacion-investigador'], { queryParams: { returnUrl: estado.url } });
  }
  return true;
};

export const investigadorVerificadoGuard: CanActivateFn = (_ruta, estado) => {
  const usuario = inject(SesionConsultaService).usuarioActual();
  const router = inject(Router);
  if (!usuario) return router.createUrlTree(['/login'], { queryParams: { returnUrl: estado.url } });
  if (usuario.rol !== 'investigador') return router.createUrlTree(['/acceso-restringido']);
  if (!usuario.credencialVerificada) {
    return router.createUrlTree(['/verificacion-investigador'], { queryParams: { returnUrl: estado.url } });
  }
  return true;
};
