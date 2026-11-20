import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {PerfilUsuario} from '../models/perfil-usuario';
import {ProgresoUsuario} from '../models/progreso-usuario';
import {UsuarioDTO} from '../models/usuario-dto';
import {Credencial} from '../models/credencial';

@Service()
export class PerfilService {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);

  // El backend saca el correo del token, por eso no se envía el id
  obtener(): Observable<PerfilUsuario> {
    return this.httpClient.get<PerfilUsuario>(this.url + '/usuarios/perfil');
  }

  update(perfil: PerfilUsuario): Observable<PerfilUsuario> {
    console.log(perfil);
    return this.httpClient.put<PerfilUsuario>(this.url + '/usuarios/perfil', perfil);
  }

  progreso(idUsuario: number): Observable<ProgresoUsuario> {
    return this.httpClient.get<ProgresoUsuario>(this.url + '/usuarios/' + idUsuario + '/progreso');
  }

  listId(idUsuario: number): Observable<UsuarioDTO> {
    return this.httpClient.get<UsuarioDTO>(this.url + '/usuarios/' + idUsuario);
  }

  registrarCredencial(idUsuario: number, credencial: Credencial): Observable<UsuarioDTO> {
    console.log(credencial);
    return this.httpClient.post<UsuarioDTO>(this.url + '/usuarios/' + idUsuario + '/credencial', credencial);
  }
}
