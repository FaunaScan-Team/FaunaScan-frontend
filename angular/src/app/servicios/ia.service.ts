import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {ResultadoIdentificacion} from '../models/resultado-identificacion';

@Service()
export class IaService {
    private url = environment.apiUrl;
    private httpClient: HttpClient = inject(HttpClient);

    // HU-27: envía la imagen en base64 y recibe las especies sugeridas
    identificar(imagen: string): Observable<ResultadoIdentificacion> {
        return this.httpClient.post<ResultadoIdentificacion>(this.url + '/ia/identificar-especie', {imagen: imagen});
    }
}