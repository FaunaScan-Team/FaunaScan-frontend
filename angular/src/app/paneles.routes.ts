import { Routes } from '@angular/router';
import { investigadorVerificadoGuard, sesionRequeridaGuard } from './guards/nohelia.guards';
import { DetalleAvistamiento } from './components/detalle-avistamiento/detalle-avistamiento';
import { Historial } from './components/historial/historial';
import { MiContribucion } from './components/mi-contribucion/mi-contribucion';
import { PanelInvestigador } from './components/paneles/panel-investigador';
import { PanelVoluntario } from './components/paneles/panel-voluntario';
import { ResumenMensual } from './components/resumen-mensual/resumen-mensual';

/**
 * Rutas de historial, paneles y reportes. Catherine debe integrarlas ANTES del comodín '**'.
 * Reutilizan las guardias de navegación del prototipo que escribió Nohelia.
 */
export const rutasPaneles: Routes = [
  { path: 'historial', component: Historial, canActivate: [sesionRequeridaGuard], title: 'Historial | FaunaScan Perú' },
  { path: 'avistamientos/:id', component: DetalleAvistamiento, canActivate: [sesionRequeridaGuard], title: 'Detalle de avistamiento | FaunaScan Perú' },
  { path: 'panel/voluntario', component: PanelVoluntario, canActivate: [sesionRequeridaGuard], title: 'Panel del voluntario | FaunaScan Perú' },
  { path: 'panel/investigador', component: PanelInvestigador, canActivate: [investigadorVerificadoGuard], title: 'Panel del investigador | FaunaScan Perú' },
  { path: 'resumen', component: ResumenMensual, canActivate: [investigadorVerificadoGuard], title: 'Resumen mensual | FaunaScan Perú' },
  { path: 'mi-contribucion', component: MiContribucion, canActivate: [sesionRequeridaGuard], title: 'Mi contribución | FaunaScan Perú' },
];
