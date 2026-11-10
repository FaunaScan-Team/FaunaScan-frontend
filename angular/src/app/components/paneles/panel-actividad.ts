import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avistamiento } from '../../models/avistamiento';

/** Actividad reciente de la comunidad, compartida por los dos paneles. */
@Component({
  selector: 'app-panel-actividad',
  imports: [DatePipe, RouterLink],
  template: `
    <section class="fs-card" aria-labelledby="fs-actividad-title">
      <h2 class="fs-card__title" id="fs-actividad-title">Actividad reciente de la comunidad</h2>
      @if (recientes().length === 0) {
        <p class="fs-muted">Todavía no hay avistamientos registrados por la comunidad.</p>
      } @else {
        @for (av of recientes(); track av.id) {
          <div class="fs-item">
            <span class="fs-avatar" aria-hidden="true">{{ av.especie.emoji || '🐾' }}</span>
            <div class="fs-grow">
              <strong>{{ av.especie.nombre }}</strong>
              <small>{{ av.registradoPor.nombre || 'Usuario no identificado' }} · 📍 {{ av.area || 'Sin zona' }}</small>
              <small>{{ av.creadoEn | date:'dd/MM/yyyy HH:mm' }}</small>
            </div>
            <a class="fs-link" [routerLink]="['/avistamientos', av.id]">Ver</a>
          </div>
        }
        <div class="fs-actions">
          <a class="fs-link" routerLink="/actividades">Ver más actividad</a>
        </div>
      }
    </section>
  `,
  styleUrl: '../compartido/paneles.css',
})
export class PanelActividad {
  readonly avistamientos = input.required<readonly Avistamiento[]>();
  readonly cantidad = input(6);

  protected readonly recientes = computed(() =>
    [...this.avistamientos()]
      .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
      .slice(0, this.cantidad()),
  );
}
