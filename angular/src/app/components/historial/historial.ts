import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Avistamiento, EstadoValidacion } from '../../core/avistamiento';
import { AvistamientosStore } from '../../core/avistamientos-store';
import { Sesion } from '../../core/sesion';
import { PanelLayout } from '../panel-layout/panel-layout';

interface Filtros {
  animal: string;
  periodo: '' | 'trimestre' | 'anio' | 'personalizado';
  desde: string;
  hasta: string;
  estado: '' | 'validado' | 'pendiente' | 'no-validado';
  zona: string;
}

const FILTROS_VACIOS: Filtros = { animal: '', periodo: '', desde: '', hasta: '', estado: '', zona: '' };

const BADGE: Record<string, { clase: string; texto: string }> = {
  Validado: { clase: 'badge-green', texto: 'VALIDADO' },
  Pendiente: { clase: 'badge-yellow', texto: 'PENDIENTE' },
  'No Validado': { clase: 'badge-gray', texto: 'NO VALIDADO' },
  Rechazado: { clase: 'badge-gray', texto: 'RECHAZADO' },
};

/** Historial de avistamientos del usuario con sesión activa (US45). */
@Component({
  selector: 'app-historial',
  imports: [FormsModule, RouterLink, PanelLayout],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial {
  private readonly store = inject(AvistamientosStore);
  private readonly sesion = inject(Sesion);
  private readonly router = inject(Router);

  /** Lo que el usuario escribe en el panel; no filtra hasta pulsar el botón. */
  protected borrador: Filtros = { ...FILTROS_VACIOS };
  private readonly aplicados = signal<Filtros>({ ...FILTROS_VACIOS });

  protected readonly mios = computed(() => this.store.deUsuario(this.sesion.email()));

  protected readonly filas = computed(() => {
    const f = this.aplicados();
    const animal = f.animal.trim().toLowerCase();
    const zona = f.zona.trim().toLowerCase();
    const [desde, hasta] = this.rangoFechas(f);

    return this.mios().filter((av) => {
      const nombre = (av.especie?.nombre ?? '').toLowerCase();
      const area = (av.area ?? '').toLowerCase();
      const estado = (av.estadoValidacion ?? 'Pendiente').toLowerCase().replace(/\s+/g, '-');
      const fecha = av.fecha ? new Date(av.fecha) : null;
      const fechaValida = fecha && !isNaN(fecha.getTime()) ? fecha : null;

      if (animal && !nombre.includes(animal)) return false;
      if (zona && !area.includes(zona)) return false;
      if (f.estado && estado !== f.estado) return false;
      if (desde && (!fechaValida || fechaValida < desde)) return false;
      if (hasta && (!fechaValida || fechaValida > hasta)) return false;
      return true;
    });
  });

  protected readonly favoritos = computed(() => this.mios().filter((av) => av.favorito));

  protected readonly sinRegistros = computed(() => this.mios().length === 0);
  protected readonly sinResultados = computed(() => !this.sinRegistros() && this.filas().length === 0);

  protected aplicarFiltros(): void {
    this.aplicados.set({ ...this.borrador });
  }

  protected limpiarFiltros(): void {
    this.borrador = { ...FILTROS_VACIOS };
    this.aplicados.set({ ...FILTROS_VACIOS });
  }

  protected alternarFavorito(av: Avistamiento, evento: Event): void {
    evento.stopPropagation();
    this.store.alternarFavorito(av.id);
  }

  protected abrirDetalle(id: string): void {
    this.router.navigate(['/avistamientos', id]);
  }

  protected badge(estado: EstadoValidacion | undefined) {
    return BADGE[estado ?? 'Pendiente'] ?? BADGE['Pendiente'];
  }

  protected formatearFecha(valor: string | undefined): string {
    if (!valor) return '—';
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return valor;
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  /** Traduce el selector de período a un rango concreto de fechas. */
  private rangoFechas(f: Filtros): [Date | null, Date | null] {
    const hoy = new Date();
    if (f.periodo === 'trimestre') {
      const inicio = new Date(hoy);
      inicio.setMonth(inicio.getMonth() - 3);
      return [inicio, null];
    }
    if (f.periodo === 'anio') {
      return [new Date(hoy.getFullYear(), 0, 1), null];
    }
    if (f.periodo === 'personalizado') {
      const desde = f.desde ? new Date(f.desde + 'T00:00:00') : null;
      const hasta = f.hasta ? new Date(f.hasta + 'T23:59:59') : null;
      return [desde, hasta];
    }
    return [null, null];
  }
}
