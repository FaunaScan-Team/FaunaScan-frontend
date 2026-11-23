import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {ImagenAvistamiento} from '../models/imagen-avistamiento';

// HU-10: fotos de un avistamiento en nuestra API (ImagenAvistamientoController).
// El backend solo guarda la URL; el archivo está en Cloudinary.
@Service()
export class ImagenAvistamientoService {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);

  list(idAvistamiento: number): Observable<ImagenAvistamiento[]> {
    return this.httpClient.get<ImagenAvistamiento[]>(this.url + '/avistamientos/' + idAvistamiento + '/imagenes');
  }

  // Sin idImagen (lo genera la base de datos) e idAvistamiento va en la ruta
  insert(idAvistamiento: number, rutaImagen: string, esPrincipal: boolean): Observable<ImagenAvistamiento> {
    return this.httpClient.post<ImagenAvistamiento>(this.url + '/avistamientos/' + idAvistamiento + '/imagenes',
      {rutaImagen: rutaImagen, esPrincipal: esPrincipal});
  }

  delete(idAvistamiento: number, idImagen: number) {
    return this.httpClient.delete(this.url + '/avistamientos/' + idAvistamiento + '/imagenes/' + idImagen);
  }
}
