import { Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Chart, registerables } from 'chart.js';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReporteDetalleApi, ReportesApiService, ZonaActividadApi } from '../../servicios/reportes-api.service';

Chart.register(...registerables);

function fechaIso(fecha: Date): string {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

@Component({
  selector: 'app-reportes-biodiversidad',
  imports: [RouterLink, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './reportes-biodiversidad.html',
  styleUrl: './reportes-api.css',
})
export class ReportesBiodiversidad {
  private readonly api = inject(ReportesApiService);
  private readonly destroyRef = inject(DestroyRef);
  private grafico: Chart<'bar'> | null = null;
  @ViewChild('lienzoEspecies', { static: true }) private lienzo!: ElementRef<HTMLCanvasElement>;

  readonly inicio = signal<Date | null>(new Date(new Date().getFullYear(), 0, 1));
  readonly fin = signal<Date | null>(new Date());
  readonly area = signal('');
  readonly zonas = signal<ZonaActividadApi[]>([]);
  readonly reporte = signal<ReporteDetalleApi | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');

  constructor() {
    this.api.tendencias().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.zonas.set(data.zonasMasActivas ?? []),
      // Si falla la lista de zonas, el usuario conserva la opción "Todas".
      error: () => this.zonas.set([]),
    });
  }

  generar(): void {
    const inicio = this.inicio();
    const fin = this.fin();
    if (!inicio || !fin) {
      this.error.set('Selecciona ambas fechas para generar el reporte.');
      return;
    }
    if (inicio.getTime() > fin.getTime()) {
      this.error.set('La fecha inicial no puede ser posterior a la final.');
      return;
    }
    if (this.cargando()) return;
    this.error.set('');
    this.cargando.set(true);
    this.api.biodiversidad(fechaIso(inicio), fechaIso(fin), this.area())
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (datos) => {
          this.reporte.set(datos);
          this.cargando.set(false);
          this.dibujar(datos);
        },
        error: (err: { status?: number }) => {
          this.reporte.set(null);
          this.grafico?.destroy();
          this.grafico = null;
          this.cargando.set(false);
          this.error.set(err.status === 403
            ? 'Tu cuenta no tiene autorización para generar reportes.'
            : 'No se pudo generar el reporte. Comprueba la conexión con la API.');
        },
      });
  }

  private dibujar(datos: ReporteDetalleApi): void {
    this.grafico?.destroy();
    this.grafico = null;
    const items = (datos.items ?? []).slice(0, 12);
    if (items.length === 0) return;
    this.grafico = new Chart(this.lienzo.nativeElement, {
      type: 'bar',
      data: {
        labels: items.map(x => x.nombreComun),
        datasets: [{ label: 'Avistamientos validados', data: items.map(x => x.totalRegistros), backgroundColor: '#237653' }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  }

  ngOnDestroy(): void {
    this.grafico?.destroy();
  }
}
