import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  readonly actual = signal<Usuario | null>(this.leer());

  private leer(): Usuario | null {
    try {
      const valor = localStorage.getItem('faunaUser');
      return valor ? JSON.parse(valor) as Usuario : null;
    } catch {
      return null;
    }
  }

  guardar(usuario: Usuario): void {
    localStorage.setItem('faunaUser', JSON.stringify(usuario));
    this.actual.set(usuario);
  }

  salir(): void {
    // Conservamos la cuenta de demostración para permitir volver a iniciar sesión.
    sessionStorage.removeItem('faunaSesion');
    this.actual.set(this.leer());
  }

  iniciar(usuario: Usuario): void {
    sessionStorage.setItem('faunaSesion', usuario.email);
    this.actual.set(usuario);
  }

  sesionActiva(): boolean {
    return !!this.actual() && sessionStorage.getItem('faunaSesion') === this.actual()?.email;
  }

  async hash(clave: string): Promise<string> {
    const bytes = new TextEncoder().encode(clave);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  destino(usuario: Usuario): string {
    if (usuario.rol === 'investigador' && !usuario.credencialVerificada) return '/verificacion-investigador';
    return usuario.rol === 'investigador' ? '/dashboard-investigador' : '/dashboard-voluntario';
  }
}
