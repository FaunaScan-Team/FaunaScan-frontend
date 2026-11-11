import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';
import { rachaDias } from '../compartido/estadisticas-avistamientos';
import { PanelActividad } from './panel-actividad';
import { PanelProgreso } from './panel-progreso';

/** Migración de public/dashboard-voluntario.html. Módulo de historial y reportes. */
@Component({
  selector: 'app-panel-voluntario',
  imports: [DatePipe, RouterLink, PanelProgreso, PanelActividad],
  template: `
    <section class="fs-page" aria-labelledby="fs-voluntario-title">
      <div class="fs-banner">
        <div>
          <p class="fs-eyebrow" style="color:#b7e3cb;">Panel del voluntario</p>
          <h1 id="fs-voluntario-title">Hola, {{ nombre() }}</h1>
          <p>Tu monitoreo contribuye a la preservación de la fauna peruana.</p>
        </div>
        <div class="fs-banner__dato">
          <p>{{ hoy | date:'dd/MM/yyyy' }}</p>
          <strong>🔥 {{ racha() }}</strong>
          <p>{{ racha() === 1 ? 'día activo' : 'días activos seguidos' }}</p>
        </div>
      </div>

      <p class="fs-demo">Datos locales de demostración: los contadores se calculan con los avistamientos guardados en este navegador.</p>

      <nav class="fs-acciones-rapidas" aria-label="Acciones rápidas">
        <a class="fs-accion fs-accion--principal" routerLink="/registrar"><span aria-hidden="true">➕</span> Nuevo registro</a>
        <a class="fs-accion" routerLink="/catalogo"><span aria-hidden="true">📘</span> Catálogo</a>
        <a class="fs-accion" routerLink="/mapa"><span aria-hidden="true">🗺️</span> Mapa</a>
        <a class="fs-accion" routerLink="/historial"><span aria-hidden="true">🕑</span> Historial</a>
        <a class="fs-accion" routerLink="/mi-contribucion"><span aria-hidden="true">🌱</span> Mi contribución</a>
      </nav>

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
export class PanelVoluntario {
  private readonly servicio = inject(AvistamientosService);
  private readonly sesion = inject(SesionConsultaService);

  protected readonly hoy = new Date();
  protected readonly nombre = computed(() => this.sesion.usuarioActual()?.nombre || 'voluntario');
  protected readonly todos = this.servicio.lista;

  protected readonly mios = computed(() => {
    const email = this.sesion.usuarioActual()?.email.toLowerCase();
    if (!email) return this.servicio.lista();
    return this.servicio.lista().filter((av) => av.registradoPor.email.toLowerCase() === email);
  });

  protected readonly racha = computed(() => rachaDias(this.mios()));
}
