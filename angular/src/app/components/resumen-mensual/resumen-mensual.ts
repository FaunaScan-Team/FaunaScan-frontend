import {Component, inject} from '@angular/core';
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
  styleUrl: '../compartido/paneles.css',
})
export class ResumenMensual {
  reporte: ReporteMensual = new ReporteMensual();
  indiceElegido: number = 0;
  cargando: boolean = true;
  error: string = '';
  panelesService: PanelesService = inject(PanelesService);

  ngOnInit() {
    this.panelesService.resumenMensual().subscribe({
      next: data => {
        console.log('Resumen mensual traído por API:', data);
        this.reporte = data;
        this.cargando = false;
      },
      error: err => {
        console.log('Error al cargar el resumen:', err.status);
        this.error = 'No se pudo cargar el resumen mensual.';
        this.cargando = false;
      }
    });
  }

  elegir(indice: number) {
    this.indiceElegido = indice;
  }

  mesActual(): ResumenMes {
    return this.reporte.meses[this.indiceElegido];
  }

  etiqueta(mes: ResumenMes): string {
    return MESES[mes.mes - 1] + ' ' + mes.anio;
  }

  // La lista viene del mes más reciente al más antiguo, así que el mes anterior es el siguiente índice
  avisos(): string[] {
    const avisos: string[] = [];
    const actual = this.reporte.meses[this.indiceElegido];
    const anterior = this.reporte.meses[this.indiceElegido + 1];
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
