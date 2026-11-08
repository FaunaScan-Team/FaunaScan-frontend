/** Contrato temporal acordado con Catherine. NO gestiona contraseñas ni tokens. */
export interface UsuarioSesion {
  nombre: string;
  email: string;
  rol: 'investigador' | 'voluntario';
  credencialVerificada: boolean;
}
