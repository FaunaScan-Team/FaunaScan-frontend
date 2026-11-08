import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avistamiento } from '../../models/avistamiento';
import { AvistamientosService } from '../../servicios/avistamientos.service';

@Component({
  selector: 'app-actividades-recientes',
  imports: [DatePipe, RouterLink],
  template: `
    <section class="nohe-page" aria-labelledby="act-title">
      <div class="nohe-heading"><div><p class="nohe-eyebrow">Comunidad FaunaScan</p><h1 id="act-title">Actividades recientes</h1>
      <p class="nohe-subtitle">Avistamientos registrados recientemente por la comunidad.</p></div></div>
      <p class="nohe-demo">Los registros mostrados provienen del almacenamiento local compartido por el prototipo Angular.</p>
      @if (registros().length === 0) {
        <div class="nohe-empty">Todavía no hay avistamientos registrados. <a routerLink="/registrar">Registrar uno</a>.</div>
      } @else {
        <div class="nohe-columns nohe-columns--activity">
          <div class="nohe-stack" role="group" aria-label="Actividad de la comunidad">
            @for (av of registros(); track av.id) {
              <button type="button" class="nohe-card nohe-activity-item"
                [class.nohe-activity-item--selected]="seleccionado()?.id === av.id"
                [attr.aria-pressed]="seleccionado()?.id === av.id" (click)="seleccionar(av)">
                <span class="nohe-avatar" aria-hidden="true">{{ av.especie.emoji || '🐾' }}</span>
                <span class="nohe-grow"><strong>{{ av.especie.nombre }}</strong>
                  <small>📍 {{ av.area }} · {{ av.fecha | date:'dd/MM/yyyy' }}</small>
                  <small>Estado: {{ av.estadoValidacion }}</small></span>
              </button>
            }
          </div>
          @if (seleccionado(); as av) {
            <article class="nohe-card nohe-aside">
              <h2>{{ av.especie.emoji }} {{ av.especie.nombre }}</h2>
              <p class="nohe-muted"><em>{{ av.especie.nombreCientifico }}</em></p>
              <p><strong>Registrado por:</strong> {{ av.registradoPor?.nombre || 'Usuario no identificado' }}</p>
              <p><strong>Fecha:</strong> {{ av.fecha | date:'dd/MM/yyyy HH:mm' }}</p>
              <p><strong>Zona:</strong> {{ av.area }}</p>
              <p><strong>Descripción:</strong> {{ av.descripcion || 'Sin descripción' }}</p>
              @if (av.latitud !== null && av.longitud !== null) {
                <p><strong>Coordenadas:</strong> {{ av.latitud }}, {{ av.longitud }}</p>
                <a class="nohe-link" [href]="urlMapa(av)" target="_blank" rel="noopener noreferrer">Ver ubicación en OpenStreetMap ↗</a>
              } @else { <p class="nohe-muted">Este registro no incluye coordenadas.</p> }
              <div class="nohe-actions"><a [routerLink]="['/avistamientos', av.id]" class="nohe-btn nohe-btn--outline">Ver historial detallado</a></div>
            </article>
          }
        </div>
      }
    </section>
  `,
  styleUrl: './nohelia.css',
})
export class ActividadesRecientes {
  private readonly servicio = inject(AvistamientosService);
  protected readonly registros = computed(() => [...this.servicio.lista()].sort(
    (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(),
  ));
  protected readonly idSeleccionado = signal<string | null>(null);
  protected readonly seleccionado = computed(() => this.registros().find((av) => av.id === this.idSeleccionado()) ?? this.registros()[0] ?? null);

  protected seleccionar(av: Avistamiento): void { this.idSeleccionado.set(av.id); }

  protected urlMapa(av: Avistamiento): string {
    if (av.latitud === null || av.longitud === null) return 'https://www.openstreetmap.org/';
    const lat = encodeURIComponent(av.latitud.toString());
    const lon = encodeURIComponent(av.longitud.toString());
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`;
  }
}
