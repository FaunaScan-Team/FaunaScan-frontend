import {ResumenMes} from './resumen-mes';

// Campos de ReporteDetalleDTO que usa el resumen mensual.
// El backend devuelve los meses del más reciente al más antiguo y solo cuenta avistamientos validados.
export class ReporteMensual {
  meses: ResumenMes[] = [];
  totalRegistros: number = 0;
  totalEspecies: number = 0;
}
