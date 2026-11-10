import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';
import { especiesDistintas, siguienteMeta, zonasDistintas } from '../compartido/estadisticas-avistamientos';

/** Migración de public/mi-contribucion.html. Módulo de historial y reportes. */
@Component({
  selector: 'app-mi-contribucion',
  imports: [DatePipe, RouterLink],
  template: `
    <section class="fs-page" aria-labelledby="fs-contrib-title">
      <div class="fs-heading">
        <div>
          <p class="fs-eyebrow">Mi actividad</p>
          <h1 id="fs-contrib-title">Mi contribución a la conservación</h1>
          <p class="fs-subtitle">Lo que has aportado con tus registros, {{ nombre() }}.</p>
        </div>
        <a class="fs-btn fs-btn--primary" routerLink="/registrar">Registrar avistamiento</a>
      </div>

      <div class="fs-stats">
        <div class="fs-stat"><strong>{{ mios().length }}</strong><span>avistamientos registrados</span></div>
        <div class="fs-stat"><strong>{{ especies() }}</strong><span>especies distintas identificadas</span></div>
        <div class="fs-stat"><strong>{{ zonas() }}</strong><span>zonas visitadas</span></div>
        <div class="fs-stat"><strong>{{ validados() }}</strong><span>registros validados</span></div>
      </div>

      <div class="fs-card">
        <h2 class="fs-card__title">Mis últimos avistamientos</h2>
        @if (ultimos().length === 0) {
          <p class="fs-empty">Aún no tienes avistamientos registrados. <a routerLink="/registrar">Registra el primero</a>.</p>
        } @else {
          @for (av of ultimos(); track av.id) {
            <div class="fs-item">
              <span class="fs-avatar" aria-hidden="true">{{ av.especie.emoji || '🐾' }}</span>
              <div class="fs-grow">
                <strong>{{ av.especie.nombre }}</strong>
                <small>📍 {{ av.area || 'Sin zona' }} · {{ av.fecha | date:'dd/MM/yyyy HH:mm' }}</small>
                <span class="fs-badge" [class]="claseEstado(av.estadoValidacion)">{{ av.estadoValidacion }}</span>
              </div>
              <a class="fs-link" [routerLink]="['/avistamientos', av.id]">Ver detalle</a>
            </div>
          }
          <div class="fs-actions">
            <a class="fs-link" routerLink="/historial">Ver todo el historial</a>
          </div>
        }
      </div>

      <div class="fs-card">
        <h2 class="fs-card__title">🌱 Tu progreso</h2>
        <p>{{ mensajeMeta() }}</p>
        <div class="fs-progreso" role="img" [attr.aria-label]="'Progreso: ' + porcentaje() + '%'">
          <div class="fs-progreso__relleno" [style.width.%]="porcentaje()"></div>
        </div>
        <small>{{ mios().length }} de {{ meta() }} avistamientos hacia la siguiente insignia.</small>
      </div>
    </section>
  `,
  styleUrl: '../compartido/paneles.css',
})
export class MiContribucion {
  private readonly servicio = inject(AvistamientosService);
  private readonly sesion = inject(SesionConsultaService);

  protected readonly nombre = computed(() => this.sesion.usuarioActual()?.nombre || 'voluntario');

  protected readonly mios = computed(() => {
    const email = this.sesion.usuarioActual()?.email.toLowerCase();
    if (!email) return this.servicio.lista();
    return this.servicio.lista().filter((av) => av.registradoPor.email.toLowerCase() === email);
  });

  protected readonly especies = computed(() => especiesDistintas(this.mios()));
  protected readonly zonas = computed(() => zonasDistintas(this.mios()));
  protected readonly validados = computed(() =>
    this.mios().filter((av) => av.estadoValidacion === 'Validado').length,
  );

  protected readonly ultimos = computed(() =>
    [...this.mios()].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5),
  );

  protected readonly meta = computed(() => siguienteMeta(this.mios().length));
  protected readonly porcentaje = computed(() => {
    const meta = this.meta();
    if (meta === 0) return 100;
    return Math.min(100, Math.round((this.mios().length / meta) * 100));
  });

  protected readonly mensajeMeta = computed(() => {
    const total = this.mios().length;
    if (total === 0) return 'Registra tu primer avistamiento para empezar tu progreso.';
    const faltan = this.meta() - total;
    if (faltan <= 0) return 'Alcanzaste todas las metas registradas en el prototipo. ¡Sigue así!';
    return `Te faltan ${faltan} avistamiento(s) para la siguiente insignia.`;
  });

  protected claseEstado(estado: string): string {
    if (estado === 'Validado') return 'fs-badge--validado';
    if (estado === 'Rechazado') return 'fs-badge--rechazado';
    return 'fs-badge--pendiente';
  }
}
