
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NotificacionApi {
  idNotificacion: number;
  idUsuario: number;
  tipo: string;
  mensaje: string;
  leido: boolean;
  fechaCreacion: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  obtenerTodas(idUsuario: number): Observable<NotificacionApi[]> {
    return this.http.get<NotificacionApi[]>(
      `${this.apiUrl}/usuarios/${idUsuario}/notificaciones`
    );
  }

  obtenerNoLeidas(idUsuario: number): Observable<NotificacionApi[]> {
    return this.http.get<NotificacionApi[]>(
      `${this.apiUrl}/usuarios/${idUsuario}/notificaciones/no-leidas`
    );
  }

  marcarComoLeida(idNotificacion: number): Observable<NotificacionApi> {
    return this.http.patch<NotificacionApi>(
      `${this.apiUrl}/notificaciones/${idNotificacion}/leer`,
      {}
    );
  }

  eliminar(idNotificacion: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/notificaciones/${idNotificacion}`
    );
  }
}
