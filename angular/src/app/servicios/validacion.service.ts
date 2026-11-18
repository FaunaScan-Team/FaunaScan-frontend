
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type DecisionValidacion = 'validado' | 'rechazado';

export interface AvistamientoApi {
  idAvistamiento: number;
  idUsuario: number | null;
  nombreUsuario: string | null;
  idEspecie: number;
  nombreEspecie: string | null;
  idUbicacion: number;
  fechaAvistamiento: string | null;
  observaciones: string | null;
  condicionesEntorno: string | null;
  estadoValidacion: string | null;
  fechaValidacion: string | null;
  idInvestigadorValidador: number | null;
  sincronizadoLocal: boolean | null;
  fechaRegistro: string | null;
}

@Injectable({ providedIn: 'root' })
export class ValidacionService {
  private readonly http = inject(HttpClient);

  private readonly url =
    `${environment.apiUrl}/avistamientos`;

  obtenerPendientes(): Observable<AvistamientoApi[]> {
    return this.http.get<AvistamientoApi[]>(
      `${this.url}/pendientes-validacion`
    );
  }

  obtenerDetalle(id: number): Observable<AvistamientoApi> {
    return this.http.get<AvistamientoApi>(
      `${this.url}/${id}`
    );
  }

  resolver(
    id: number,
    estado: DecisionValidacion
  ): Observable<AvistamientoApi> {
    return this.http.put<AvistamientoApi>(
      `${this.url}/${id}/validacion`,
      { estado }
    );
  }
}
