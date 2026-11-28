import {DatePipe} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DashboardVoluntario} from '../../models/dashboard-voluntario';
import {PanelesService} from '../../servicios/paneles.service';
import {AuthService} from '../../servicios/auth.service';
import {ActividadesApiService, ActividadRecienteApi} from '../../servicios/actividades-api.service';
import {PanelActividad} from './panel-actividad';

// HU-53: panel principal del voluntario con los datos de GET /dashboard/voluntario
@Component({
  selector: 'app-panel-voluntario',
  imports: [DatePipe, RouterLink, PanelActividad],
  templateUrl: './panel-voluntario.html',
  styleUrl: './panel-voluntario.css',
})
export class PanelVoluntario {
  hoy: Date = new Date();
  dashboard = signal<DashboardVoluntario>(new DashboardVoluntario());
  recientes = signal<ActividadRecienteApi[]>([]);
  validados = signal<number>(0);
  cargando = signal<boolean>(true);
  error = signal<string>('');
  panelesService: PanelesService = inject(PanelesService);
  actividadesService: ActividadesApiService = inject(ActividadesApiService);
  authService: AuthService = inject(AuthService);

  // Hasta 3 guías en el panel, como en el diseño
  guias = computed(() => this.dashboard().guias.slice(0, 3));

  claseConservacion(estado: string): string {
    const texto = (estado || '').toLowerCase();
    if (texto.includes('peligro')) return 'fs-sello--rojo';
    if (texto.includes('vulnerable') || texto.includes('amenazado')) return 'fs-sello--naranja';
    return 'fs-sello--verde';
  }

  ngOnInit() {
    this.panelesService.dashboardVoluntario().subscribe({
      next: data => {
        console.log('Panel del voluntario traído por API:', data);
        this.dashboard.set(data);
        this.cargando.set(false);
      },
      error: err => {
        console.log('Error al cargar el panel:', err.status);
        this.error.set('No se pudo cargar tu panel. Intenta de nuevo en unos segundos.');
        this.cargando.set(false);
      }
    });

    this.panelesService.contribucion(this.authService.idUsuario()).subscribe({
      next: data => this.validados.set(data.avistamientosValidados),
      error: err => console.log('Error al cargar la contribución:', err.status)
    });

    this.actividadesService.obtenerRecientes().subscribe({
      next: data => this.recientes.set(data),
      error: err => console.log('Error al cargar la actividad reciente:', err.status)
    });
  }
}
