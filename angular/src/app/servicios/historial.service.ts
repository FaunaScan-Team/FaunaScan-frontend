import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {AvistamientoDTO} from '../models/avistamiento-dto';
import {AvistamientoFavorito} from '../models/avistamiento-favorito';
import {AvistamientoCompartido} from '../models/avistamiento-compartido';
import {Ubicacion} from '../models/ubicacion';
import {ImagenAvistamiento} from '../models/imagen-avistamiento';

@Service()
export class HistorialService {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);

  // HU-24: todos los avistamientos del usuario
  historial(idUsuario: number): Observable<AvistamientoDTO[]> {
    return this.httpClient.get<AvistamientoDTO[]>(this.url + '/usuarios/' + idUsuario + '/avistamientos/historial');
  }

  // HU-25: filtros opcionales por especie, zona y estado
  historialFiltrado(idUsuario: number, especie: string, zona: string, estado: string): Observable<AvistamientoDTO[]> {
    return this.httpClient.get<AvistamientoDTO[]>(this.url + '/usuarios/' + idUsuario + '/avistamientos/historial/filtros',
      {params: {especie: especie, zona: zona, estado: estado}});
  }

  listId(id: number): Observable<AvistamientoDTO> {
    return this.httpClient.get<AvistamientoDTO>(this.url + '/avistamientos/' + id);
  }

  // HU-47: solo el dueño del avistamiento o un admin
  delete(id: number) {
    return this.httpClient.delete(this.url + '/avistamientos/' + id);
  }

  imagenes(idAvistamiento: number): Observable<ImagenAvistamiento[]> {
    return this.httpClient.get<ImagenAvistamiento[]>(this.url + '/avistamientos/' + idAvistamiento + '/imagenes');
  }

  ubicacion(idUbicacion: number): Observable<Ubicacion> {
    return this.httpClient.get<Ubicacion>(this.url + '/ubicaciones/' + idUbicacion);
  }

  // HU-26: favoritos
  favoritos(idUsuario: number): Observable<AvistamientoFavorito[]> {
    return this.httpClient.get<AvistamientoFavorito[]>(this.url + '/usuarios/' + idUsuario + '/favoritos');
  }

  marcarFavorito(idAvistamiento: number) {
    return this.httpClient.post(this.url + '/avistamientos/' + idAvistamiento + '/favorito', {});
  }

  quitarFavorito(idAvistamiento: number) {
    return this.httpClient.delete(this.url + '/avistamientos/' + idAvistamiento + '/favorito');
  }

  // HU-56: compartir con otro investigador
  compartir(idAvistamiento: number, compartido: AvistamientoCompartido) {
    return this.httpClient.post(this.url + '/avistamientos/' + idAvistamiento + '/compartir', compartido);
  }

  compartidosRecibidos(idUsuario: number): Observable<AvistamientoCompartido[]> {
    return this.httpClient.get<AvistamientoCompartido[]>(this.url + '/avistamientos/compartidos/recibidos/' + idUsuario);
  }
}
