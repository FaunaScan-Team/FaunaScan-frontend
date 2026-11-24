import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MisReportesApiService, ReporteDetalleApi } from '../../servicios/mis-reportes-api.service';

@Component({
  selector: 'app-reporte-compartido',
  imports: [DatePipe, RouterLink],
  templateUrl: './reporte-compartido.html',
  styleUrl: './mis-reportes.css',
})
export class ReporteCompartido implements OnInit {
  private readonly api = inject(MisReportesApiService);
  private readonly ruta = inject(ActivatedRoute);
  readonly detalle = signal<ReporteDetalleApi | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    const token = this.ruta.snapshot.paramMap.get('token');
    if (!token) {
      this.error.set('El enlace compartido no contiene un token válido.');
      this.cargando.set(false);
      return;
    }
    this.api.obtenerCompartido(token).subscribe({
      next: (datos) => {
        this.detalle.set(datos);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(error.status === 401 ? 'Inicia sesión para ver este reporte.' :
          error.status === 404 ? 'No existe un reporte con este enlace.' :
          error.status === 0 ? 'No se pudo conectar con la API.' :
          'No se pudo abrir este reporte. Comprueba el enlace y tus permisos.');
      },
    });
  }

  nombreTipo(tipo: string): string {
    return tipo?.toLowerCase() === 'mensual' ? 'Resumen mensual' : 'Reporte de biodiversidad';
  }
}
