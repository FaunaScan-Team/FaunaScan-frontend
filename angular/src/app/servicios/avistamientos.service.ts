import { Injectable, computed, signal } from '@angular/core';
import {
  Avistamiento,
  NuevoAvistamiento,
  ObservacionesDetalladas,
} from '../models/avistamiento';

/** Valores del formulario de registro que se conservan al ir a /observaciones y volver. */
export interface BorradorRegistro {
  especieId: number | null;
  fecha: string;
  area: string;
  latitud: number | null;
  longitud: number | null;
  descripcion: string;
}

const CLAVE_ALMACENAMIENTO = 'faunascan-angular-avistamientos';

/**
 * Servicio temporal de avistamientos (todavía sin backend).
 * Guarda los datos en memoria y además en localStorage para que el
 * historial no se pierda al recargar la página.
 *
 * Uso desde historial / detalle:
 *   private readonly avistamientos = inject(AvistamientosService);
 *   this.avistamientos.lista()            -> todos, el más reciente primero
 *   this.avistamientos.obtenerPorId(id)   -> uno o undefined si no existe
 */
@Injectable({ providedIn: 'root' })
export class AvistamientosService {
  private readonly datos = signal<Avistamiento[]>(this.leerAlmacenamiento());

  /** Lista de solo lectura, ordenada del más reciente al más antiguo. */
  readonly lista = this.datos.asReadonly();
  readonly total = computed(() => this.datos().length);

  /** Borrador del registro en curso (no se guarda en localStorage). */
  readonly borrador = signal<BorradorRegistro | null>(null);
  readonly observacionesBorrador = signal<ObservacionesDetalladas | null>(null);

  obtenerPorId(id: string): Avistamiento | undefined {
    return this.datos().find((avistamiento) => avistamiento.id === id);
  }

  registrar(nuevo: NuevoAvistamiento): Avistamiento {
    const avistamiento: Avistamiento = {
      ...nuevo,
      id: this.generarId(),
      estadoValidacion: 'Pendiente',
      creadoEn: new Date().toISOString(),
    };
    this.datos.update((lista) => [avistamiento, ...lista]);
    this.guardarAlmacenamiento();
    this.limpiarBorrador();
    return avistamiento;
  }

  limpiarBorrador(): void {
    this.borrador.set(null);
    this.observacionesBorrador.set(null);
  }

  private generarId(): string {
    return `av-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private leerAlmacenamiento(): Avistamiento[] {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO) ?? '[]');
      return Array.isArray(guardado) ? guardado : [];
    } catch {
      return [];
    }
  }

  private guardarAlmacenamiento(): void {
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(this.datos()));
    } catch {
      // Sin almacenamiento disponible: los datos quedan solo en memoria.
    }
  }
}
