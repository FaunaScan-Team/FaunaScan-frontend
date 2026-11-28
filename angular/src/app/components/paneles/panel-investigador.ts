import {DatePipe} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DashboardInvestigador} from '../../models/dashboard-investigador';
import {ProgresoUsuario} from '../../models/progreso-usuario';
import {PanelesService} from '../../servicios/paneles.service';
import {PerfilService} from '../../servicios/perfil.service';
import {AuthService} from '../../servicios/auth.service';
import {AvistamientoApi, ValidacionService} from '../../servicios/validacion.service';

// HU-52: panel principal del investigador con los datos de GET /dashboard/investigador
@Component({
  selector: 'app-panel-investigador',
  imports: [DatePipe, RouterLink],
  templateUrl: './panel-investigador.html',
  styleUrl: './panel-investigador.css',
})
export class PanelInvestigador {
  hoy: Date = new Date();
  dashboard = signal<DashboardInvestigador>(new DashboardInvestigador());
  progreso = signal<ProgresoUsuario>(new ProgresoUsuario());
  pendientes = signal<AvistamientoApi[]>([]);
  validados = signal<number>(0);
  cargando = signal<boolean>(true);
  error = signal<string>('');
  panelesService: PanelesService = inject(PanelesService);
  perfilService: PerfilService = inject(PerfilService);
  validacionService: ValidacionService = inject(ValidacionService);
  authService: AuthService = inject(AuthService);

  // El administrador también entra a este panel; el rol viene en la respuesta del backend
  esAdmin = computed(() => this.dashboard().rol === 'ROLE_ADMIN' || this.authService.rol() === 'ROLE_ADMIN');
  saludo = computed(() => {
    const nombre = this.dashboard().nombre;
    if (nombre) {
      return 'Hola, ' + nombre;
    }
    return this.esAdmin() ? 'Hola, administrador' : 'Hola, investigador';
  });

  // Últimos 5 registros pendientes, del más reciente al más antiguo
  ultimosPendientes = computed(() => [...this.pendientes()]
    .sort((a, b) => (b.fechaAvistamiento || '').localeCompare(a.fechaAvistamiento || ''))
    .slice(0, 5));

  ngOnInit() {
    const idUsuario = this.authService.idUsuario();

    this.panelesService.dashboardInvestigador().subscribe({
      next: data => {
        console.log('Panel del investigador traído por API:', data);
        this.dashboard.set(data);
        this.cargando.set(false);
      },
      error: err => {
        console.log('Error al cargar el panel:', err.status);
        this.error.set(err.status === 403
          ? 'Este panel es solo para investigadores.'
          : 'No se pudo cargar tu panel. Intenta de nuevo en unos segundos.');
        this.cargando.set(false);
      }
    });

    this.perfilService.progreso(idUsuario).subscribe({
      next: data => this.progreso.set(data),
      error: err => console.log('Error al cargar el progreso:', err.status)
    });

    this.panelesService.contribucion(idUsuario).subscribe({
      next: data => this.validados.set(data.avistamientosValidados),
      error: err => console.log('Error al cargar la contribución:', err.status)
    });

    this.validacionService.obtenerPendientes().subscribe({
      next: data => this.pendientes.set(data),
      error: err => console.log('Error al cargar los pendientes:', err.status)
    });
  }

  iniciales(nombre: string | null): string {
    if (!nombre) return '?';
    return nombre.trim().split(/\s+/).slice(0, 2).map(parte => parte.charAt(0).toUpperCase()).join('');
  }
}
