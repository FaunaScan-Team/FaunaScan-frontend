import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import {
  ResumenMes,
  agruparPorMes,
  alertasDelMes,
  conteoPorZona,
  especiesDistintas,
  zonasDistintas,
} from '../compartido/estadisticas-avistamientos';

/** Migración de public/resumen.html. Módulo de historial y reportes. */
@Component({
  selector: 'app-resumen-mensual',
  imports: [RouterLink],
  template: `
    <section class="fs-page" aria-labelledby="fs-resumen-title">
      <div class="fs-heading">
        <div>
          <p class="fs-eyebrow">Reportes</p>
          <h1 id="fs-resumen-title">Resumen mensual</h1>
          <p class="fs-subtitle">Actividad de la comunidad agrupada por mes: registros, especies, zonas y avisos.</p>
        </div>
        <a class="fs-btn fs-btn--outline" routerLink="/historial">Ir al historial</a>
      </div>

      <p class="fs-demo">Los avisos se calculan con reglas del prototipo, no con el estado de conservación de cada especie.</p>

      @if (meses().length === 0) {
        <p class="fs-empty">Todavía no hay avistamientos registrados. <a routerLink="/registrar">Registra el primero</a>.</p>
      } @else {
        <div class="fs-columns">
          <aside class="fs-card">
            <h2 class="fs-card__title">Meses</h2>
            <div class="fs-meses">
              @for (mes of meses(); track mes.clave) {
                <button type="button" class="fs-mes" [class.fs-mes--activo]="mes.clave === claveElegida()"
                  [attr.aria-current]="mes.clave === claveElegida() ? 'true' : null"
                  (click)="claveElegida.set(mes.clave)">
                  {{ mes.etiqueta }} <small>· {{ mes.avistamientos.length }}</small>
                </button>
              }
            </div>
          </aside>

          <div>
            @if (mesActual(); as mes) {
              <div class="fs-banner">
                <div>
                  <h2>{{ mes.etiqueta }}</h2>
                  <p>{{ mes.avistamientos.length }} registro(s) en este período.</p>
                </div>
              </div>

              <div class="fs-stats">
                <div class="fs-stat"><strong>{{ mes.avistamientos.length }}</strong><span>Registros</span></div>
                <div class="fs-stat"><strong>{{ especies() }}</strong><span>Especies</span></div>
                <div class="fs-stat"><strong>{{ zonas() }}</strong><span>Zonas</span></div>
                <div class="fs-stat"><strong>{{ alertas().length }}</strong><span>Avisos</span></div>
              </div>

              <div class="fs-card">
                <h2 class="fs-card__title">Zonas monitoreadas</h2>
                @if (zonasDelMes().length === 0) {
                  <p class="fs-muted">Sin áreas registradas para este período.</p>
                } @else {
                  <div class="fs-logros">
                    @for (zona of zonasDelMes(); track zona.zona) {
                      <div class="fs-logro">
                        <strong>{{ zona.zona }}</strong>
                        <small>{{ zona.total }} avistamiento(s)</small>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="fs-card">
                <h2 class="fs-card__title">Avisos del mes</h2>
                @if (alertas().length === 0) {
                  <p class="fs-muted">Sin avisos: no hubo variaciones relevantes respecto al mes anterior.</p>
                } @else {
                  @for (alerta of alertas(); track alerta) {
                    <p class="fs-aviso">{{ alerta }}</p>
                  }
                }
              </div>
            }
          </div>
        </div>
      }
    </section>
  `,
  styleUrl: '../compartido/paneles.css',
})
export class ResumenMensual {
  private readonly servicio = inject(AvistamientosService);

  protected readonly meses = computed<ResumenMes[]>(() => agruparPorMes(this.servicio.lista()));
  /** Mes elegido por el usuario; vacío significa "el más reciente". */
  protected readonly claveElegida = signal('');

  protected readonly mesActual = computed(() => {
    const lista = this.meses();
    return lista.find((mes) => mes.clave === this.claveElegida()) ?? lista[0];
  });

  private readonly mesAnterior = computed(() => {
    const lista = this.meses();
    const indice = lista.findIndex((mes) => mes.clave === this.mesActual()?.clave);
    return indice >= 0 ? lista[indice + 1] : undefined;
  });

  protected readonly especies = computed(() => especiesDistintas(this.mesActual()?.avistamientos ?? []));
  protected readonly zonas = computed(() => zonasDistintas(this.mesActual()?.avistamientos ?? []));
  protected readonly zonasDelMes = computed(() => conteoPorZona(this.mesActual()?.avistamientos ?? []));

  protected readonly alertas = computed(() => {
    const mes = this.mesActual();
    return mes ? alertasDelMes(mes, this.mesAnterior()) : [];
  });
}
