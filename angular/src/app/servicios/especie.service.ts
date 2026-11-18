import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Especie} from '../models/especie';
import {GuiaIdentificacion} from '../models/guia-identificacion';

@Service()
export class EspecieService {
    private url = environment.apiUrl;
    private httpClient: HttpClient = inject(HttpClient);

    list(): Observable<Especie[]> {
        return this.httpClient.get<Especie[]>(this.url + '/especies');
    }

    listId(id: number): Observable<Especie> {
        return this.httpClient.get<Especie>(this.url + '/especies/' + id);
    }

    // HU-07: busca por nombre común o científico
    buscar(texto: string): Observable<Especie[]> {
        return this.httpClient.get<Especie[]>(this.url + '/especies/buscar', {params: {query: texto}});
    }

    // HU-58: guía de identificación para no expertos
    guia(id: number): Observable<GuiaIdentificacion> {
        return this.httpClient.get<GuiaIdentificacion>(this.url + '/especies/' + id + '/guia-identificacion');
    }
}