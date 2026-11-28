import {Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ReporteMensual} from '../../models/reporte-mensual';
import {ResumenMes} from '../../models/resumen-mes';
import {PanelesService} from '../../servicios/paneles.service';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// HU-19: resumen mensual de biodiversidad con los datos de GET /reportes/mensuales
@Component({
  selector: 'app-resumen-mensual',
  imports: [RouterLink],
  templateUrl: './resumen-mensual.html',
  styleUrl: './resumen-mensual.css',
})
export class ResumenMensual {
  reporte = signal<ReporteMensual>(new ReporteMensual());
  indiceElegido = signal<number>(0);
  cargando = signal<boolean>(true);
  error = signal<string>('');
  panelesService: PanelesService = inject(PanelesService);

  ngOnInit() {
    this.panelesService.resumenMensual().subscribe({
      next: data => {
        console.log('Resumen mensual traído por API:', data);
        this.reporte.set(data);
        this.cargando.set(false);
      },
      error: err => {
        console.log('Error al cargar el resumen:', err.status);
        this.error.set('No se pudo cargar el resumen mensual.');
        this.cargando.set(false);
      }
    });
  }

  // El gráfico va del mes más antiguo al más reciente y muestra hasta 12 meses
  grafico = computed(() => {
    const meses = this.reporte().meses.slice(0, 12);
    const maximo = Math.max(1, ...meses.map(mes => mes.totalAvistamientos));
    return meses.map((mes, indice) => ({
      mes,
      indice,
      alturaAvistamientos: Math.round(mes.totalAvistamientos * 100 / maximo),
      alturaEspecies: Math.round(mes.totalEspecies * 100 / maximo),
    })).reverse();
  });

  promedioMensual = computed(() => {
    const meses = this.reporte().meses;
    return meses.length === 0 ? 0 : Math.round(this.reporte().totalRegistros * 10 / meses.length) / 10;
  });

  etiquetaCorta(mes: ResumenMes): string {
    return MESES[mes.mes - 1].slice(0, 3) + ' ' + String(mes.anio).slice(2);
  }

  nombreMes(mes: ResumenMes): string {
    return MESES[mes.mes - 1];
  }

  elegir(indice: number) {
    this.indiceElegido.set(indice);
  }

  mesActual(): ResumenMes {
    return this.reporte().meses[this.indiceElegido()];
  }

  etiqueta(mes: ResumenMes): string {
    return MESES[mes.mes - 1] + ' ' + mes.anio;
  }

  // La lista viene del mes más reciente al más antiguo, así que el mes anterior es el siguiente índice
  avisos(): string[] {
    const avisos: string[] = [];
    const actual = this.reporte().meses[this.indiceElegido()];
    const anterior = this.reporte().meses[this.indiceElegido() + 1];
    if (!actual) {
      return avisos;
    }
    if (anterior && anterior.totalAvistamientos > 0) {
      const variacion = Math.round(((actual.totalAvistamientos - anterior.totalAvistamientos) / anterior.totalAvistamientos) * 100);
      if (variacion <= -30) {
        avisos.push('Los registros validados bajaron ' + Math.abs(variacion) + '% respecto a ' + this.etiqueta(anterior) + '.');
      }
      if (variacion >= 50) {
        avisos.push('Los registros validados subieron ' + variacion + '% respecto a ' + this.etiqueta(anterior) + '.');
      }
    }
    if (actual.totalEspecies === 1) {
      avisos.push('En este mes solo se validó una especie.');
    }
    return avisos;
  }
}
