import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {AvistamientoDTO} from '../models/avistamiento-dto';
import {Ubicacion} from '../models/ubicacion';

// HU-06 y HU-48: registrar y editar avistamientos contra la API.
// Reemplaza al avistamientos.service.ts local (ese se borra en la integración del 22/11).
@Service()
export class AvistamientoService {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);

  list(): Observable<AvistamientoDTO[]> {
    return this.httpClient.get<AvistamientoDTO[]>(this.url + '/avistamientos');
  }

  listId(id: number): Observable<AvistamientoDTO> {
    return this.httpClient.get<AvistamientoDTO>(this.url + '/avistamientos/' + id);
  }

  // Se envían solo los campos que se registran. Sin idAvistamiento (lo genera la base de datos)
  // y sin idUsuario: el backend lo toma del token del usuario autenticado.
  insert(avistamiento: AvistamientoDTO): Observable<AvistamientoDTO> {
    const nuevo = {
      idEspecie: avistamiento.idEspecie,
      idUbicacion: avistamiento.idUbicacion,
      fechaAvistamiento: avistamiento.fechaAvistamiento,
      observaciones: avistamiento.observaciones,
      condicionesEntorno: avistamiento.condicionesEntorno || null,
      sincronizadoLocal: false,
    };
    return this.httpClient.post<AvistamientoDTO>(this.url + '/avistamientos', nuevo);
  }

  update(avistamiento: AvistamientoDTO): Observable<AvistamientoDTO> {
    return this.httpClient.put<AvistamientoDTO>(this.url + '/avistamientos/' + avistamiento.idAvistamiento, avistamiento);
  }

  // HU-47: solo el dueño del avistamiento o un admin
  delete(id: number) {
    return this.httpClient.delete(this.url + '/avistamientos/' + id);
  }

  // El avistamiento guarda idUbicacion: primero se crea la ubicación con latitud y longitud
  insertUbicacion(ubicacion: Ubicacion): Observable<Ubicacion> {
    const nueva = {latitud: ubicacion.latitud, longitud: ubicacion.longitud, direccion: ubicacion.direccion};
    return this.httpClient.post<Ubicacion>(this.url + '/ubicaciones', nueva);
  }

  updateUbicacion(ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.httpClient.put<Ubicacion>(this.url + '/ubicaciones/' + ubicacion.idUbicacion, ubicacion);
  }

  listUbicacion(idUbicacion: number): Observable<Ubicacion> {
    return this.httpClient.get<Ubicacion>(this.url + '/ubicaciones/' + idUbicacion);
  }
}
