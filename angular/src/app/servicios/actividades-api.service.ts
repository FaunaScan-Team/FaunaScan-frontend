
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ActividadRecienteApi {
  idAvistamiento: number;
  nombreUsuario: string;
  apellidoUsuario: string;
  nombreComun: string;
  estadoConservacion: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  fechaAvistamiento: string;
}

@Injectable({ providedIn: 'root' })
export class ActividadesApiService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  obtenerRecientes(): Observable<ActividadRecienteApi[]> {
    return this.http.get<ActividadRecienteApi[]>(
      `${this.apiUrl}/avistamientos/comunidad/recientes`
    );
  }
}
