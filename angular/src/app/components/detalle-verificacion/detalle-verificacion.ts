
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  AvistamientoApi,
  DecisionValidacion,
  ValidacionService
} from '../../servicios/validacion.service';

@Component({
  selector: 'app-detalle-verificacion',
  imports: [DatePipe, RouterLink, MatSnackBarModule],
  templateUrl: './detalle-verificacion.html',
  styleUrl: './detalle-verificacion.css',
})
export class DetalleVerificacion implements OnInit {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly validacionService = inject(ValidacionService);
  private readonly snackBar = inject(MatSnackBar);

  registro: AvistamientoApi | null = null;
  cargando = false;
  procesando = false;
  error = '';

  ngOnInit(): void {
    const parametro = this.ruta.snapshot.paramMap.get('id');
    const id = Number(parametro);

    if (parametro === null || !Number.isInteger(id) || id <= 0) {
      this.error = 'El identificador del avistamiento no es válido.';
      return;
    }

    this.cargarDetalle(id);
  }

  cargarDetalle(id: number): void {
    this.cargando = true;
    this.error = '';

    this.validacionService.obtenerDetalle(id).subscribe({
      next: (avistamiento) => {
        this.registro = avistamiento;
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.registro = null;
        this.cargando = false;
        this.error = this.obtenerMensajeError(error);
      }
    });
  }

  resolver(estado: DecisionValidacion): void {
    const avistamiento = this.registro;

    if (!avistamiento || this.procesando) {
      return;
    }

    if (avistamiento.estadoValidacion?.toLowerCase() !== 'pendiente') {
      this.error = 'Este avistamiento ya no está pendiente.';
      return;
    }

    this.procesando = true;
    this.error = '';

    this.validacionService
      .resolver(avistamiento.idAvistamiento, estado)
      .subscribe({
        next: () => {
          this.procesando = false;

          const mensaje = estado === 'validado'
            ? 'Avistamiento validado correctamente.'
            : 'Avistamiento rechazado correctamente.';

          this.snackBar.open(mensaje, 'Cerrar', {
            duration: 4000
          });

          void this.router.navigate(['/verificar']);
        },
        error: (error: HttpErrorResponse) => {
          this.procesando = false;
          this.error = this.obtenerMensajeError(error);

          this.snackBar.open(this.error, 'Cerrar', {
            duration: 5000
          });
        }
      });
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No hay conexión con el backend de FaunaScan.';
    }

    if (error.status === 401) {
      return 'Tu sesión ha vencido. Inicia sesión nuevamente.';
    }

    if (error.status === 403) {
      return 'No tienes permiso para validar este avistamiento.';
    }

    if (error.status === 404) {
      return 'El avistamiento solicitado no existe.';
    }

    if (error.status === 409) {
      return 'Este avistamiento ya fue procesado.';
    }

    return 'No fue posible completar la operación.';
  }
}
