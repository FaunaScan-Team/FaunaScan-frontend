import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, map} from 'rxjs';
import {environment} from '../../environments/environment';

// Lo que devuelve Cloudinary al subir una imagen (solo usamos secure_url)
interface RespuestaCloudinary {
  secure_url: string;
  public_id: string;
}

// HU-10: API externa Cloudinary. Guarda la foto en la nube y devuelve su URL pública.
// Se usa un upload preset "unsigned", así que no viaja ninguna clave secreta.
// No es nuestra API, por eso el interceptor no le agrega el token.
@Service()
export class CloudinaryService {
  private url = 'https://api.cloudinary.com/v1_1/' + environment.cloudinaryCloudName + '/image/upload';
  private httpClient: HttpClient = inject(HttpClient);

  subir(archivo: File): Observable<string> {
    const datos = new FormData();
    datos.append('file', archivo);
    datos.append('upload_preset', environment.cloudinaryUploadPreset);
    datos.append('folder', 'faunascan');
    return this.httpClient.post<RespuestaCloudinary>(this.url, datos).pipe(
      map((respuesta) => respuesta.secure_url),
    );
  }
}
