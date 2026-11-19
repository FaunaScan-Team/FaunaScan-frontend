import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, map} from 'rxjs';

// Respuesta de Open-Meteo con los datos actuales que pedimos
export interface ClimaActual {
  temperatura: number;
  humedad: number;
  codigo: number;
}

// API externa Open-Meteo (gratuita y sin clave): clima actual según latitud y longitud.
// No es nuestra API, por eso el interceptor no le agrega el token.
@Service()
export class ClimaService {
  private url = 'https://api.open-meteo.com/v1/forecast';
  private httpClient: HttpClient = inject(HttpClient);

  actual(latitud: number, longitud: number): Observable<ClimaActual> {
    return this.httpClient.get<any>(this.url, {
      params: {
        latitude: latitud,
        longitude: longitud,
        current: 'temperature_2m,relative_humidity_2m,weather_code',
        timezone: 'auto',
      }
    }).pipe(map((r) => ({
      temperatura: Math.round(r.current.temperature_2m),
      humedad: Math.round(r.current.relative_humidity_2m),
      codigo: r.current.weather_code,
    })));
  }
}
