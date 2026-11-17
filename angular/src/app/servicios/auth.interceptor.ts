import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {environment} from '../../environments/environment';
import {AuthService} from './auth.service';

// Agrega "Authorization: Bearer <token>" a cada petición que va a nuestra API.
// Es lo que espera el JwtRequestFilter del backend.
// No se agrega a las APIs externas (mapas, clima, fotos) para no enviarles el token.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (token && req.url.startsWith(environment.apiUrl)) {
    const reqConToken = req.clone({
      setHeaders: {Authorization: 'Bearer ' + token}
    });
    return next(reqConToken);
  }
  return next(req);
};
