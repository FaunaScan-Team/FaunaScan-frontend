// Mismos campos que UsuarioDTO del backend
export class UsuarioDTO {
  idUsuario: number = 0;
  idRol: number = 0;
  nombreRol: string = '';
  idPerfil: number = 0;
  nombre: string = '';
  apellido: string = '';
  correo: string = '';
  fechaRegistro: string = '';
  estado: boolean = true;
  urlCredencial: string = '';
  preferenciasNotificaciones: string = '';
}
