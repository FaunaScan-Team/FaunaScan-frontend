import {DatePipe} from '@angular/common';
import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {Contribucion} from '../../models/contribucion';
import {ProgresoUsuario} from '../../models/progreso-usuario';
import {AvistamientoDTO} from '../../models/avistamiento-dto';
import {PanelesService} from '../../servicios/paneles.service';
import {PerfilService} from '../../servicios/perfil.service';
import {HistorialService} from '../../servicios/historial.service';
import {AuthService} from '../../servicios/auth.service';
import {siguienteMeta} from '../compartido/logros';

// HU-54 y HU-23: contribución y progreso del usuario con los datos del backend
@Component({
  selector: 'app-mi-contribucion',
  imports: [DatePipe, RouterLink],
  templateUrl: './mi-contribucion.html',
  styleUrl: '../compartido/paneles.css',
})
export class MiContribucion {
  contribucion: Contribucion = new Contribucion();
  progreso: ProgresoUsuario = new ProgresoUsuario();
  ultimos: AvistamientoDTO[] = [];
  cargando: boolean = true;
  error: string = '';
  panelesService: PanelesService = inject(PanelesService);
  perfilService: PerfilService = inject(PerfilService);
  historialService: HistorialService = inject(HistorialService);
  authService: AuthService = inject(AuthService);

  ngOnInit() {
    const idUsuario = this.authService.idUsuario();

    this.panelesService.contribucion(idUsuario).subscribe({
      next: data => {
        console.log('Contribución traída por API:', data);
        this.contribucion = data;
        this.cargando = false;
      },
      error: err => {
        console.log('Error al cargar la contribución:', err.status);
        this.error = 'No se pudo cargar tu contribución.';
        this.cargando = false;
      }
    });

    this.perfilService.progreso(idUsuario).subscribe({
      next: data => this.progreso = data,
      error: err => console.log('Error al cargar el progreso:', err.status)
    });

    this.historialService.historial(idUsuario).subscribe({
      next: data => {
        this.ultimos = [...data]
          .sort((a, b) => (b.fechaAvistamiento || '').localeCompare(a.fechaAvistamiento || ''))
          .slice(0, 5);
      },
      error: err => console.log('Error al cargar los últimos avistamientos:', err.status)
    });
  }

  meta(): number {
    return siguienteMeta(this.contribucion.totalAvistamientos);
  }

  porcentaje(): number {
    const meta = this.meta();
    if (meta === 0) {
      return 100;
    }
    return Math.min(100, Math.round((this.contribucion.totalAvistamientos / meta) * 100));
  }

  mensajeMeta(): string {
    const total = this.contribucion.totalAvistamientos;
    if (total === 0) {
      return 'Registra tu primer avistamiento para empezar tu progreso.';
    }
    const faltan = this.meta() - total;
    if (faltan <= 0) {
      return 'Alcanzaste todas las metas de avistamientos. ¡Sigue así!';
    }
    return 'Te faltan ' + faltan + ' avistamiento(s) para la siguiente insignia.';
  }

  // El backend guarda el estado en minúscula: pendiente, validado o rechazado
  etiquetaEstado(estado: string): string {
    return estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : 'Pendiente';
  }

  claseEstado(estado: string): string {
    if (estado === 'validado') return 'fs-badge--validado';
    if (estado === 'rechazado') return 'fs-badge--rechazado';
    return 'fs-badge--pendiente';
  }
}
