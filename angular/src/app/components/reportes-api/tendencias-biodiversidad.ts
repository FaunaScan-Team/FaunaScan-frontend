import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Chart, registerables } from 'chart.js';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportesApiService, TendenciasApi, TendenciaEspecieApi } from '../../servicios/reportes-api.service';

Chart.register(...registerables);

@Component({
  selector: 'app-tendencias-biodiversidad',
  imports: [RouterLink, MatFormFieldModule, MatSelectModule],
  templateUrl: './tendencias-biodiversidad.html',
  styleUrl: './reportes-api.css',
})
export class TendenciasBiodiversidad implements OnInit {
  private readonly api = inject(ReportesApiService);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('lienzoMeses', { static: true }) private meses!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lienzoZonas', { static: true }) private zonas!: ElementRef<HTMLCanvasElement>;
  private graficoMensual: Chart<'line'> | null = null;
  private graficoZonas: Chart<'bar'> | null = null;

  readonly especies = signal<string[]>([]);
  readonly especie = signal('');
  readonly tendencias = signal<TendenciasApi | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.actualizar();
  }

  actualizar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.tendencias().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.tendencias.set(data);
        this.especies.set([...new Set((data.porEspecie ?? []).map(x => x.nombreComun))].sort());
        this.cargando.set(false);
        this.dibujar(data);
      },
      error: (err: { status?: number }) => {
        this.cargando.set(false);
        this.tendencias.set(null);
        this.graficoMensual?.destroy();
        this.graficoZonas?.destroy();
        this.graficoMensual = null;
        this.graficoZonas = null;
        this.error.set(err.status === 403 ? 'No tienes autorización para consultar tendencias.' :
          'No se pudieron consultar las tendencias de la API.');
      },
    });
  }

  seleccionarEspecie(value: string): void {
    this.especie.set(value);
    const datos = this.tendencias();
    if (datos) this.dibujar(datos);
  }

  private dibujar(datos: TendenciasApi): void {
    this.graficoMensual?.destroy();
    this.graficoZonas?.destroy();
    this.graficoMensual = null;
    this.graficoZonas = null;

    const series = (datos.porEspecie ?? []).filter((x) => !this.especie() || x.nombreComun === this.especie());
    const porMes = new Map<string, number>();
    series.forEach((x: TendenciaEspecieApi) => {
      const key = `${x.anio}-${String(x.mes).padStart(2, '0')}`;
      porMes.set(key, (porMes.get(key) ?? 0) + x.totalAvistamientos);
    });
    const meses = [...porMes.keys()].sort();
    if (meses.length) {
      this.graficoMensual = new Chart(this.meses.nativeElement, {
        type: 'line',
        data: { labels: meses, datasets: [{
          label: this.especie() || 'Todas las especies',
          data: meses.map(x => porMes.get(x) ?? 0), borderColor: '#237653', backgroundColor: '#cce9d7',
          borderWidth: 3, tension: 0.25, pointRadius: 4,
        }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
    }

    const zonas = (datos.zonasMasActivas ?? []).slice(0, 10);
    if (zonas.length) {
      this.graficoZonas = new Chart(this.zonas.nativeElement, {
        type: 'bar',
        data: { labels: zonas.map(z => z.direccion), datasets: [{
          label: 'Avistamientos validados', data: zonas.map(z => z.totalAvistamientos),
          backgroundColor: '#457fa4',
        }] },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.graficoMensual?.destroy();
    this.graficoZonas?.destroy();
  }
}
