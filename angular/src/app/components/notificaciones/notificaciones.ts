
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../servicios/auth.service';
import {
  NotificacionApi,
  NotificacionesApiService
} from '../../servicios/notificaciones-api.service';

type Filtro = 'todas' | 'criticas' | 'sistema' | 'alertas';

@Component({
  selector: 'app-notificaciones',
  imports: [DatePipe, RouterLink],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class Notificaciones implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(NotificacionesApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  notificaciones: NotificacionApi[] = [];
  filtro: Filtro = 'todas';
  noLeidas = 0;
  cargando = false;
  error = '';

  readonly filtros: { valor: Filtro; texto: string }[] = [
    { valor: 'todas', texto: 'Todas' },
    { valor: 'criticas', texto: 'Críticas' },
    { valor: 'sistema', texto: 'Sistema' },
    { valor: 'alertas', texto: 'Alertas' },
  ];

  ngOnInit(): void {
    this.actualizar();
  }

 
actualizar(): void {
  const idUsuario = this.authService.idUsuario();

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    this.error = 'Debes iniciar sesión para consultar tus notificaciones.';
    this.cargando = false;
    this.cdr.markForCheck();
    return;
  }

  this.cargando = true;
  this.error = '';

  this.apiService.obtenerTodas(idUsuario).subscribe({
    next: (datos) => {
      this.notificaciones = datos;
      this.cargando = false;
      this.cdr.markForCheck();
      this.actualizarNoLeidas(idUsuario);
    },
    error: () => {
      this.cargando = false;
      this.error = 'No se pudieron cargar las notificaciones desde la API.';
      this.cdr.markForCheck();
    }
  });
}

private actualizarNoLeidas(idUsuario: number): void {
  this.apiService.obtenerNoLeidas(idUsuario).subscribe({
    next: (datos) => {
      this.noLeidas = datos.length;
      this.cdr.markForCheck();
    },
    error: () => {
      this.noLeidas = this.notificaciones.filter(
        n => !n.leido
      ).length;
      this.cdr.markForCheck();
    }
  });
}

  categoria(notificacion: NotificacionApi): Filtro {
    const tipo = notificacion.tipo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (tipo.includes('crit')) return 'criticas';
    if (tipo.includes('sist')) return 'sistema';
    return 'alertas';
  }

  get visibles(): NotificacionApi[] {
    return this.notificaciones.filter(
      n => this.filtro === 'todas' || this.categoria(n) === this.filtro
    );
  }

  contar(categoria: Filtro): number {
    return this.notificaciones.filter(
      n => this.categoria(n) === categoria
    ).length;
  }

  marcarLeida(idNotificacion: number): void {
    this.apiService.marcarComoLeida(idNotificacion).subscribe({
      next: () => {
        this.snackBar.open(
          'Notificación marcada como leída',
          'Cerrar',
          { duration: 3000 }
        );
        this.actualizar();
      },
      error: () => {
        this.snackBar.open(
          'No se pudo marcar la notificación',
          'Cerrar',
          { duration: 4000 }
        );
      },
    });
  }

  eliminar(idNotificacion: number): void {
    if (!window.confirm('¿Deseas eliminar esta notificación?')) {
      return;
    }

    this.apiService.eliminar(idNotificacion).subscribe({
      next: () => {
        this.snackBar.open(
          'Notificación eliminada',
          'Cerrar',
          { duration: 3000 }
        );
        this.actualizar();
      },
      error: () => {
        this.snackBar.open(
          'No se pudo eliminar la notificación',
          'Cerrar',
          { duration: 4000 }
        );
      },
    });
  }
}
