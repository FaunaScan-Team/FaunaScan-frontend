import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Especie, Observaciones } from '../../core/avistamiento';
import { AvistamientosStore } from '../../core/avistamientos-store';
import { PanelLayout } from '../panel-layout/panel-layout';

/**
 * Detalle de un avistamiento, con edición y eliminación (US46, US47, US48).
 *
 * Regla de negocio que ya traía la versión HTML: un avistamiento validado
 * por un investigador queda congelado; editar y eliminar se desactivan.
 */
@Component({
  selector: 'app-detalle-avistamiento',
  imports: [FormsModule, RouterLink, PanelLayout],
  templateUrl: './detalle-avistamiento.html',
  styleUrl: './detalle-avistamiento.css',
})
export class DetalleAvistamiento {
  private readonly store = inject(AvistamientosStore);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  private readonly id = toSignal(this.ruta.paramMap.pipe(map((p) => p.get('id'))), {
    initialValue: this.ruta.snapshot.paramMap.get('id'),
  });

  protected readonly registro = computed(() => this.store.porId(this.id()));
  protected readonly especie = computed<Especie>(() => this.registro()?.especie ?? {});
  protected readonly observaciones = computed<Observaciones>(() => this.registro()?.observaciones ?? {});
  protected readonly bloqueado = computed(() => this.registro()?.estadoValidacion === 'Validado');

  protected readonly editando = signal(false);
  protected readonly modalAbierto = signal(false);
  protected readonly eliminando = signal(false);

  /** Campos del formulario de edición. */
  protected edicion = { nombre: '', fecha: '', descripcion: '' };

  constructor() {
    // Si cambia el registro (otra pestaña, o se cargó después), el formulario
    // de edición arranca siempre con los valores vigentes.
    effect(() => {
      const av = this.registro();
      if (!av || this.editando()) return;
      this.edicion = {
        nombre: av.especie?.nombre ?? '',
        fecha: this.paraInputFecha(av.fecha),
        descripcion: av.observaciones?.descripcion ?? '',
      };
    });
  }

  protected abrirEdicion(): void {
    if (this.bloqueado()) return;
    this.editando.set(true);
  }

  protected cancelarEdicion(): void {
    const av = this.registro();
    this.edicion = {
      nombre: av?.especie?.nombre ?? '',
      fecha: this.paraInputFecha(av?.fecha),
      descripcion: av?.observaciones?.descripcion ?? '',
    };
    this.editando.set(false);
  }

  protected guardarEdicion(): void {
    const av = this.registro();
    if (!av || this.bloqueado()) return;

    this.store.actualizar(av.id, {
      especie: { ...(av.especie ?? {}), nombre: this.edicion.nombre.trim() || av.especie?.nombre },
      fecha: this.edicion.fecha ? new Date(this.edicion.fecha).toISOString() : av.fecha,
      observaciones: { ...(av.observaciones ?? {}), descripcion: this.edicion.descripcion },
    });
    this.editando.set(false);
  }

  protected pedirConfirmacion(): void {
    if (this.bloqueado()) return;
    this.modalAbierto.set(true);
  }

  protected cerrarModal(): void {
    if (this.eliminando()) return;
    this.modalAbierto.set(false);
  }

  @HostListener('document:keydown.escape')
  protected cerrarConEscape(): void {
    this.cerrarModal();
  }

  protected confirmarEliminacion(): void {
    const av = this.registro();
    if (!av) return;
    this.eliminando.set(true);
    this.store.eliminar(av.id);
    this.router.navigate(['/historial']);
  }

  protected readonly claseValidacion = computed(() => {
    const estado = this.registro()?.estadoValidacion ?? 'Pendiente';
    if (estado === 'Validado') return 'badge-green';
    if (estado === 'Pendiente') return 'badge-yellow';
    return 'badge-gray';
  });

  /** Las métricas se muestran en inputs de solo lectura, que esperan texto. */
  protected metrica(valor: number | string | undefined): string {
    return valor === undefined || valor === '' ? '—' : String(valor);
  }

  protected formatearFechaHora(valor: string | undefined): string {
    if (!valor) return '—';
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return valor;
    return (
      fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' - ' +
      fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    );
  }

  /** Convierte la fecha guardada al formato que espera <input type="datetime-local">. */
  private paraInputFecha(valor: string | undefined): string {
    if (!valor) return '';
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return '';
    const dosDigitos = (n: number) => String(n).padStart(2, '0');
    return (
      fecha.getFullYear() +
      '-' + dosDigitos(fecha.getMonth() + 1) +
      '-' + dosDigitos(fecha.getDate()) +
      'T' + dosDigitos(fecha.getHours()) +
      ':' + dosDigitos(fecha.getMinutes())
    );
  }
}
