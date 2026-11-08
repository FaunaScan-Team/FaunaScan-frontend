import { Injectable } from '@angular/core';
import { UsuarioSesion } from '../models/usuario-sesion';

/**
 * Adaptador de lectura temporal del frontend anterior (`faunaUser`).
 * Catherine debe sustituir el origen cuando esté disponible su servicio de sesión.
 * No implementa autenticación ni concede autorización del servidor.
 */
@Injectable({ providedIn: 'root' })
export class SesionConsultaService {
  usuarioActual(): UsuarioSesion | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const dato: unknown = JSON.parse(localStorage.getItem('faunaUser') ?? 'null');
      if (!dato || typeof dato !== 'object') return null;
      const usuario = dato as Record<string, unknown>;
      if (typeof usuario['email'] !== 'string' || !usuario['email'].trim()) return null;
      if (typeof usuario['nombre'] !== 'string') return null;
      if (usuario['rol'] !== 'investigador' && usuario['rol'] !== 'voluntario') return null;
      return {
        email: usuario['email'].trim().toLowerCase(),
        nombre: usuario['nombre'],
        rol: usuario['rol'],
        credencialVerificada: usuario['credencialVerificada'] === true,
      };
    } catch {
      return null;
    }
  }
}
