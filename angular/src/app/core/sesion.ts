import { Injectable, computed, signal } from '@angular/core';
import { Usuario } from './avistamiento';

const CLAVE = 'faunaUser';

/**
 * Lee la sesión que dejó login.js en localStorage ("faunaUser").
 * Equivale a la parte de auth-guard.js que expone window.FaunaAuth.user.
 */
@Injectable({ providedIn: 'root' })
export class Sesion {
  private readonly actual = signal<Usuario | null>(this.leer());

  readonly usuario = computed(() => this.actual());
  readonly email = computed(() => this.actual()?.email);
  readonly haySesion = computed(() => this.actual() !== null);

  constructor() {
    // Si el usuario inicia o cierra sesión en otra pestaña, esta se entera.
    window.addEventListener('storage', (evento) => {
      if (evento.key === CLAVE) this.actual.set(this.leer());
    });
  }

  /** Vuelve a leer localStorage. El guard la llama en cada navegación,
   *  porque el login todavía vive en las páginas HTML. */
  recargar(): Usuario | null {
    const usuario = this.leer();
    this.actual.set(usuario);
    return usuario;
  }

  private leer(): Usuario | null {
    try {
      return JSON.parse(localStorage.getItem(CLAVE) ?? 'null') as Usuario | null;
    } catch {
      return null;
    }
  }
}
