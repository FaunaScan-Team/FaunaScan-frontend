import {DatePipe} from '@angular/common';
import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DashboardVoluntario} from '../../models/dashboard-voluntario';
import {PanelesService} from '../../servicios/paneles.service';
import {AuthService} from '../../servicios/auth.service';
import {ActividadesApiService, ActividadRecienteApi} from '../../servicios/actividades-api.service';
import {PanelActividad} from './panel-actividad';
import {PanelProgreso} from './panel-progreso';

// HU-53: panel principal del voluntario con los datos de GET /dashboard/voluntario
@Component({
  selector: 'app-panel-voluntario',
  imports: [DatePipe, RouterLink, PanelProgreso, PanelActividad],
  templateUrl: './panel-voluntario.html',
  styleUrl: '../compartido/paneles.css',
})
export class PanelVoluntario {
  hoy: Date = new Date();
  dashboard: DashboardVoluntario = new DashboardVoluntario();
  recientes: ActividadRecienteApi[] = [];
  validados: number = 0;
  cargando: boolean = true;
  error: string = '';
  panelesService: PanelesService = inject(PanelesService);
  actividadesService: ActividadesApiService = inject(ActividadesApiService);
  authService: AuthService = inject(AuthService);

  ngOnInit() {
    this.panelesService.dashboardVoluntario().subscribe({
      next: data => {
        console.log('Panel del voluntario traído por API:', data);
        this.dashboard = data;
        this.cargando = false;
      },
      error: err => {
        console.log('Error al cargar el panel:', err.status);
        this.error = 'No se pudo cargar tu panel. Intenta de nuevo en unos segundos.';
        this.cargando = false;
      }
    });

    this.panelesService.contribucion(this.authService.idUsuario()).subscribe({
      next: data => this.validados = data.avistamientosValidados,
      error: err => console.log('Error al cargar la contribución:', err.status)
    });

    this.actividadesService.obtenerRecientes().subscribe({
      next: data => this.recientes = data,
      error: err => console.log('Error al cargar la actividad reciente:', err.status)
    });
  }
}
