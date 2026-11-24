import {DatePipe} from '@angular/common';
import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DashboardInvestigador} from '../../models/dashboard-investigador';
import {ProgresoUsuario} from '../../models/progreso-usuario';
import {PanelesService} from '../../servicios/paneles.service';
import {PerfilService} from '../../servicios/perfil.service';
import {AuthService} from '../../servicios/auth.service';
import {ActividadesApiService, ActividadRecienteApi} from '../../servicios/actividades-api.service';
import {PanelActividad} from './panel-actividad';
import {PanelProgreso} from './panel-progreso';

// HU-52: panel principal del investigador con los datos de GET /dashboard/investigador
@Component({
  selector: 'app-panel-investigador',
  imports: [DatePipe, RouterLink, PanelProgreso, PanelActividad],
  templateUrl: './panel-investigador.html',
  styleUrl: '../compartido/paneles.css',
})
export class PanelInvestigador {
  hoy: Date = new Date();
  dashboard: DashboardInvestigador = new DashboardInvestigador();
  progreso: ProgresoUsuario = new ProgresoUsuario();
  recientes: ActividadRecienteApi[] = [];
  validados: number = 0;
  cargando: boolean = true;
  error: string = '';
  panelesService: PanelesService = inject(PanelesService);
  perfilService: PerfilService = inject(PerfilService);
  actividadesService: ActividadesApiService = inject(ActividadesApiService);
  authService: AuthService = inject(AuthService);

  ngOnInit() {
    const idUsuario = this.authService.idUsuario();

    this.panelesService.dashboardInvestigador().subscribe({
      next: data => {
        console.log('Panel del investigador traído por API:', data);
        this.dashboard = data;
        this.cargando = false;
      },
      error: err => {
        console.log('Error al cargar el panel:', err.status);
        // El endpoint solo acepta ROLE_INVESTIGADOR; un admin recibe 403
        this.error = err.status === 403
          ? 'Este panel es solo para investigadores.'
          : 'No se pudo cargar tu panel. Intenta de nuevo en unos segundos.';
        this.cargando = false;
      }
    });

    this.perfilService.progreso(idUsuario).subscribe({
      next: data => this.progreso = data,
      error: err => console.log('Error al cargar el progreso:', err.status)
    });

    this.panelesService.contribucion(idUsuario).subscribe({
      next: data => this.validados = data.avistamientosValidados,
      error: err => console.log('Error al cargar la contribución:', err.status)
    });

    this.actividadesService.obtenerRecientes().subscribe({
      next: data => this.recientes = data,
      error: err => console.log('Error al cargar la actividad reciente:', err.status)
    });
  }
}
