import { Injectable, computed, signal } from '@angular/core';

const CLAVE_ALMACENAMIENTO = 'faunascan-angular-favoritos';

/**
 * Marcas de favorito del historial (pantallas de Suárez).
 * Guarda solo IDs de avistamiento en el navegador; no toca el contrato compartido.
 */
@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly ids = signal<string[]>(this.leerAlmacenamiento());

  readonly lista = this.ids.asReadonly();
  readonly total = computed(() => this.ids().length);

  esFavorito(id: string): boolean {
    return this.ids().includes(id);
  }

  alternar(id: string): void {
    this.ids.update((actual) =>
      actual.includes(id) ? actual.filter((item) => item !== id) : [...actual, id],
    );
    this.guardarAlmacenamiento();
  }

  quitar(id: string): void {
    this.ids.update((actual) => actual.filter((item) => item !== id));
    this.guardarAlmacenamiento();
  }

  private leerAlmacenamiento(): string[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const guardado: unknown = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO) ?? '[]');
      return Array.isArray(guardado) ? guardado.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }

  private guardarAlmacenamiento(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(this.ids()));
    } catch {
      // Sin almacenamiento disponible: las marcas quedan solo en memoria.
    }
  }
}
