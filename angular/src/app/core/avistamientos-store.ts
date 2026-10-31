import { Injectable, computed, signal } from '@angular/core';
import { Avistamiento } from './avistamiento';

const CLAVE = 'faunaAvistamientos';

/**
 * Reemplazo Angular de public/assets/scripts/avistamientos-store.js.
 *
 * Mantiene la misma clave de localStorage, así que los registros creados
 * por las pantallas HTML siguen apareciendo aquí. La diferencia es que la
 * lista vive en un signal: cuando se marca un favorito o se elimina un
 * registro, el historial y el detalle se redibujan solos.
 */
@Injectable({ providedIn: 'root' })
export class AvistamientosStore {
  private readonly lista = signal<Avistamiento[]>(this.leerDeDisco());

  readonly todos = computed(() => this.lista());

  constructor() {
    // Si el usuario tiene otra pestaña abierta, la lista no se queda vieja.
    window.addEventListener('storage', (evento) => {
      if (evento.key === CLAVE) this.lista.set(this.leerDeDisco());
    });
  }

  porId(id: string | null): Avistamiento | null {
    if (!id) return null;
    return this.lista().find((av) => av.id === id) ?? null;
  }

  deUsuario(email: string | undefined): Avistamiento[] {
    if (!email) return [];
    return this.lista().filter((av) => av.registradoPor?.email === email);
  }

  agregar(avistamiento: Avistamiento): Avistamiento {
    this.guardar([avistamiento, ...this.lista()]);
    return avistamiento;
  }

  actualizar(id: string, cambios: Partial<Avistamiento>): Avistamiento | null {
    let actualizado: Avistamiento | null = null;
    const nueva = this.lista().map((av) => {
      if (av.id !== id) return av;
      actualizado = { ...av, ...cambios };
      return actualizado;
    });
    if (actualizado) this.guardar(nueva);
    return actualizado;
  }

  eliminar(id: string): void {
    this.guardar(this.lista().filter((av) => av.id !== id));
  }

  alternarFavorito(id: string): void {
    const av = this.porId(id);
    if (av) this.actualizar(id, { favorito: !av.favorito });
  }

  generarId(): string {
    return 'av-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  private guardar(lista: Avistamiento[]): void {
    this.lista.set(lista);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lista));
    } catch {
      // Modo privado o cuota llena: la app sigue usable en memoria.
    }
  }

  private leerDeDisco(): Avistamiento[] {
    try {
      const crudo: unknown = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
      return Array.isArray(crudo) ? (crudo as Avistamiento[]) : [];
    } catch {
      return [];
    }
  }
}
