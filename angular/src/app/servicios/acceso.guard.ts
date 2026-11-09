import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioService } from './usuario.service';

export const requiereSesion: CanActivateFn = (_ruta, estado) => {
  const usuarios = inject(UsuarioService);
  const router = inject(Router);
  if (!usuarios.sesionActiva()) return router.parseUrl('/login');
  const usuario = usuarios.actual()!;
  if (usuario.rol === 'investigador' && !usuario.credencialVerificada && estado.url !== '/verificacion-investigador') {
    return router.parseUrl('/verificacion-investigador');
  }
  if ((estado.url === '/dashboard-investigador' || estado.url === '/dashboard-voluntario') && estado.url !== usuarios.destino(usuario)) {
    return router.parseUrl(usuarios.destino(usuario));
  }
  return true;
};

export const redirigirPanel: CanActivateFn = () => {
  const usuarios = inject(UsuarioService);
  const router = inject(Router);
  if (!usuarios.sesionActiva()) return router.parseUrl('/login');
  return router.parseUrl(usuarios.destino(usuarios.actual()!));
};
