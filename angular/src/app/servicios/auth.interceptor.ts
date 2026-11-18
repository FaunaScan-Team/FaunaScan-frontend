import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {environment} from '../../environments/environment';
import {AuthService} from './auth.service';

// Agrega "Authorization: Bearer <token>" a cada petición que va a nuestra API.
// Es lo que espera el JwtRequestFilter del backend.
// No se agrega a las APIs externas (mapas, clima, fotos) para no enviarles el token.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token();
  const esNuestraApi = req.url.startsWith(environment.apiUrl);

  let peticion = req;
  if (token && esNuestraApi) {
    peticion = req.clone({
      setHeaders: {Authorization: 'Bearer ' + token}
    });
  }

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      // En /auth (login, registro) cada pantalla muestra su propio mensaje
      if (esNuestraApi && !req.url.includes('/auth/')) {
        if (error.status === 401) {
          // Token vencido o inválido: se cierra la sesión y se vuelve a iniciar
          authService.logout();
          router.navigate(['/login']);
        }
        if (error.status === 403) {
          // Con sesión, pero sin permiso para ese recurso
          router.navigate(['/acceso-restringido']);
        }
      }
      return throwError(() => error);
    })
  );
};
