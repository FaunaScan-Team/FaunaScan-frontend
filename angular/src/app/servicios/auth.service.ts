import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Login} from '../models/login';
import {AuthResponse} from '../models/auth-response';
import {UsuarioRegistro} from '../models/usuario-registro';
import {RecuperarContrasena} from '../models/recuperar-contrasena';
import {ContrasenaTemporal} from '../models/contrasena-temporal';

const CLAVE_TOKEN = 'token';
const CLAVE_ID_USUARIO = 'idUsuario';
const CLAVE_ROL = 'rol';

@Service()
export class AuthService {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);

  login(login: Login): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(this.url + '/auth/login', login);
  }

  registrar(usuario: UsuarioRegistro) {
    return this.httpClient.post(this.url + '/auth/registrar', usuario);
  }

  recuperarContrasena(datos: RecuperarContrasena): Observable<ContrasenaTemporal> {
    return this.httpClient.post<ContrasenaTemporal>(this.url + '/auth/recuperar-password', datos);
  }

  guardarSesion(respuesta: AuthResponse) {
    localStorage.setItem(CLAVE_TOKEN, respuesta.jwt);
    localStorage.setItem(CLAVE_ID_USUARIO, String(respuesta.idUsuario));
    localStorage.setItem(CLAVE_ROL, respuesta.rol);
  }

  logout() {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_ID_USUARIO);
    localStorage.removeItem(CLAVE_ROL);
  }

  token(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  rol(): string | null {
    return localStorage.getItem(CLAVE_ROL);
  }

  idUsuario(): number {
    return Number(localStorage.getItem(CLAVE_ID_USUARIO));
  }

  estaLogueado(): boolean {
    return this.token() != null;
  }
}
