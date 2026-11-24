import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {MapaAvistamiento} from '../models/mapa-avistamiento';

@Service()
export class MapaService {
    private url = environment.apiUrl;
    private httpClient: HttpClient = inject(HttpClient);

    // HU-14/HU-17: marcadores del mapa, con filtro opcional por estado
    list(estado: string): Observable<MapaAvistamiento[]> {
        if (estado) {
            return this.httpClient.get<MapaAvistamiento[]>(this.url + '/avistamientos/mapa', {params: {estado: estado}});
        }
        return this.httpClient.get<MapaAvistamiento[]>(this.url + '/avistamientos/mapa');
    }
}