import { Component, computed, input } from '@angular/core';
import { Avistamiento } from '../../models/avistamiento';
import { calcularLogros, especiesDistintas, zonasDistintas } from '../compartido/estadisticas-avistamientos';

/** Bloque "Mi progreso" + "Logros", compartido por los dos paneles. */
@Component({
  selector: 'app-panel-progreso',
  template: `
    <section class="fs-card" aria-labelledby="fs-progreso-title">
      <h2 class="fs-card__title" id="fs-progreso-title">Mi progreso</h2>
      <div class="fs-metrics">
        <div>Avistamientos <strong>{{ avistamientos().length }}</strong></div>
        <div>Especies registradas <strong>{{ especies() }}</strong></div>
        <div>Zonas visitadas <strong>{{ zonas() }}</strong></div>
      </div>
    </section>

    <section class="fs-card" aria-labelledby="fs-logros-title">
      <h2 class="fs-card__title" id="fs-logros-title">🏆 Logros obtenidos</h2>
      @if (alcanzados() === 0) {
        <p class="fs-muted">Aún no alcanzas ninguna insignia. Registra avistamientos para desbloquear la primera.</p>
      }
      <div class="fs-logros">
        @for (logro of logros(); track logro.titulo) {
          <div class="fs-logro" [class.fs-logro--bloqueado]="!logro.alcanzado">
            <span aria-hidden="true">{{ logro.icono }}</span>
            <strong>{{ logro.titulo }}</strong>
            <small>{{ logro.detalle }}</small>
          </div>
        }
      </div>
    </section>
  `,
  styleUrl: '../compartido/paneles.css',
})
export class PanelProgreso {
  readonly avistamientos = input.required<readonly Avistamiento[]>();

  protected readonly especies = computed(() => especiesDistintas(this.avistamientos()));
  protected readonly zonas = computed(() => zonasDistintas(this.avistamientos()));
  protected readonly logros = computed(() => calcularLogros(this.avistamientos()));
  protected readonly alcanzados = computed(() => this.logros().filter((logro) => logro.alcanzado).length);
}
