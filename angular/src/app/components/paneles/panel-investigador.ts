import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';
import { especiesDistintas, zonasDistintas } from '../compartido/estadisticas-avistamientos';
import { PanelActividad } from './panel-actividad';
import { PanelProgreso } from './panel-progreso';

/** Migración de public/dashboard-investigador.html. Módulo de historial y reportes. */
@Component({
  selector: 'app-panel-investigador',
  imports: [DatePipe, RouterLink, PanelProgreso, PanelActividad],
  template: `
    <section class="fs-page" aria-labelledby="fs-investigador-title">
      <div class="fs-banner fs-banner--info">
        <div>
          <p class="fs-eyebrow" style="color:#bcd9f5;">Panel del investigador</p>
          <h1 id="fs-investigador-title">Hola, {{ nombre() }}</h1>
          <p>Tu validación mantiene confiables los registros de la comunidad.</p>
          <span class="fs-banner__badge">✓ Investigador verificado</span>
        </div>
        <div class="fs-banner__dato">
          <p>{{ hoy | date:'dd/MM/yyyy' }}</p>
          <strong>{{ pendientes().length }}</strong>
          <p>pendientes de verificar</p>
        </div>
      </div>

      <p class="fs-demo">Datos locales de demostración. La autorización real deberá comprobarse en el backend.</p>

      <nav class="fs-acciones-rapidas" aria-label="Acciones rápidas">
        <a class="fs-accion fs-accion--principal" routerLink="/registrar"><span aria-hidden="true">➕</span> Nuevo registro</a>
        <a class="fs-accion" routerLink="/verificar"><span aria-hidden="true">✅</span> Verificar</a>
        <a class="fs-accion" routerLink="/resumen"><span aria-hidden="true">📊</span> Resumen mensual</a>
        <a class="fs-accion" routerLink="/catalogo"><span aria-hidden="true">📘</span> Catálogo</a>
        <a class="fs-accion" routerLink="/historial"><span aria-hidden="true">🕑</span> Historial</a>
      </nav>

      <div class="fs-stats">
        <div class="fs-stat"><strong>{{ todos().length }}</strong><span>registros de la comunidad</span></div>
        <div class="fs-stat"><strong>{{ validadosPorMi().length }}</strong><span>validados por mí</span></div>
        <div class="fs-stat"><strong>{{ especies() }}</strong><span>especies en la plataforma</span></div>
        <div class="fs-stat"><strong>{{ zonas() }}</strong><span>zonas monitoreadas</span></div>
      </div>

      <div class="fs-columns fs-columns--iguales">
        <div class="fs-stack">
          <app-panel-progreso [avistamientos]="mios()" />
        </div>
        <app-panel-actividad [avistamientos]="todos()" />
      </div>
    </section>
  `,
  styleUrl: '../compartido/paneles.css',
})
export class PanelInvestigador {
  private readonly servicio = inject(AvistamientosService);
  private readonly sesion = inject(SesionConsultaService);

  protected readonly hoy = new Date();
  protected readonly nombre = computed(() => this.sesion.usuarioActual()?.nombre || 'investigador');
  protected readonly todos = this.servicio.lista;

  protected readonly mios = computed(() => {
    const email = this.sesion.usuarioActual()?.email.toLowerCase();
    if (!email) return this.servicio.lista();
    return this.servicio.lista().filter((av) => av.registradoPor.email.toLowerCase() === email);
  });

  protected readonly pendientes = computed(() =>
    this.servicio.lista().filter((av) => av.estadoValidacion === 'Pendiente'),
  );

  protected readonly validadosPorMi = computed(() => {
    const email = this.sesion.usuarioActual()?.email.toLowerCase();
    if (!email) return [];
    return this.servicio.lista().filter((av) => av.validadoPor?.toLowerCase() === email);
  });

  protected readonly especies = computed(() => especiesDistintas(this.todos()));
  protected readonly zonas = computed(() => zonasDistintas(this.todos()));
}
