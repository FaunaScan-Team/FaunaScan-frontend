
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PreferenciasApi {
  criticas: boolean;
  sistema: boolean;
  alertas: boolean;
}

@Injectable({ providedIn: 'root' })
export class PreferenciasApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  obtener(idUsuario: number): Observable<PreferenciasApi> {
    return this.http.get<PreferenciasApi>(
      `${this.apiUrl}/usuarios/${idUsuario}/preferencias-notificaciones`
    );
  }

  guardar(
    idUsuario: number,
    preferencias: PreferenciasApi
  ): Observable<PreferenciasApi> {
    return this.http.put<PreferenciasApi>(
      `${this.apiUrl}/usuarios/${idUsuario}/preferencias-notificaciones`,
      preferencias
    );
  }
}
