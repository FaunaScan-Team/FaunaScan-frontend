import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import {
  MisReportesApiService, ReporteApi
} from '../../servicios/mis-reportes-api.service';

@Component({
  selector: 'app-mis-reportes',
  imports: [DatePipe, RouterLink, MatTableModule],
  templateUrl: './mis-reportes.html',
  styleUrl: './mis-reportes.css',
})
export class MisReportes implements OnInit {
  private readonly api = inject(MisReportesApiService);

  readonly lista = signal<ReporteApi[]>([]);
  readonly cargando = signal(false);
  readonly procesando = signal<number | null>(null);
  readonly error = signal('');
  readonly aviso = signal('');
  readonly columnas = ['idReporte', 'tipo', 'area', 'periodo', 'fechaGeneracion', 'acciones'];

  ngOnInit(): void { this.actualizar(); }

  actualizar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.aviso.set('');
    this.api.obtenerMios().subscribe({
      next: (datos) => {
        this.lista.set([...datos].sort((a, b) =>
          new Date(b.fechaGeneracion).getTime() - new Date(a.fechaGeneracion).getTime()
        ));
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(this.mensajeError(error, 'No se pudieron consultar tus reportes.'));
      },
    });
  }

  nombreTipo(tipo: string): string {
    return tipo?.toLowerCase() === 'mensual' ? 'Resumen mensual' : 'Biodiversidad';
  }

  periodo(reporte: ReporteApi): string {
    if (!reporte.fechaInicio || !reporte.fechaFin) return 'Todos los meses';
    return `${this.fechaSimple(reporte.fechaInicio)} – ${this.fechaSimple(reporte.fechaFin)}`;
  }

  private fechaSimple(iso: string): string {
    const [anio, mes, dia] = iso.split('-');
    return dia && mes && anio ? `${dia}/${mes}/${anio}` : iso;
  }

  exportarPdf(reporte: ReporteApi): void {
    if (this.procesando() !== null) return;
    this.procesando.set(reporte.idReporte);
    this.error.set('');
    this.aviso.set('');
    this.api.descargarPdf(reporte.idReporte).subscribe({
      next: (blob) => {
        if (blob.size === 0) {
          this.error.set('El PDF llegó vacío.');
        } else {
          const pdf = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
          const url = URL.createObjectURL(pdf);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-faunascan-${reporte.idReporte}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          this.aviso.set(`Se inició la descarga del reporte #${reporte.idReporte}.`);
        }
        this.procesando.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.procesando.set(null);
        this.error.set(this.mensajeError(error, 'No se pudo exportar el PDF.'));
      },
    });
  }

  compartir(reporte: ReporteApi): void {
    if (this.procesando() !== null) return;
    this.procesando.set(reporte.idReporte);
    this.error.set('');
    this.aviso.set('');
    this.api.compartir(reporte.idReporte).subscribe({
      next: async (enlace) => {
        try {
          if (!enlace.token) throw new Error('La API no devolvió el token del reporte.');
          const url = new URL(`/reportes/compartido/${encodeURIComponent(enlace.token)}`, window.location.origin).toString();
          await navigator.clipboard.writeText(url);
          this.aviso.set(`Enlace del reporte #${reporte.idReporte} copiado. Requiere iniciar sesión en FaunaScan.`);
        } catch {
          if (enlace.token) {
            const url = `${window.location.origin}/reportes/compartido/${encodeURIComponent(enlace.token)}`;
            this.aviso.set(`Copia este enlace manualmente: ${url}`);
          } else {
            this.error.set('El servidor no devolvió un enlace válido.');
          }
        } finally {
          this.procesando.set(null);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.procesando.set(null);
        this.error.set(this.mensajeError(error, 'No se pudo compartir el reporte.'));
      },
    });
  }

  private mensajeError(error: HttpErrorResponse, general: string): string {
    if (error.status === 401) return 'La sesión venció. Vuelve a iniciar sesión.';
    if (error.status === 403) return 'No tienes permisos para realizar esta operación.';
    if (error.status === 0) return 'No hay conexión con la API. Comprueba Spring Boot.';
    return general;
  }
}
