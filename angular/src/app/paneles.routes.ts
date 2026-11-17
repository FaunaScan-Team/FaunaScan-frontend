import { Routes } from '@angular/router';
import { authGuard, investigadorGuard } from './guards/auth.guard';
import { DetalleAvistamiento } from './components/detalle-avistamiento/detalle-avistamiento';
import { Historial } from './components/historial/historial';
import { MiContribucion } from './components/mi-contribucion/mi-contribucion';
import { PanelInvestigador } from './components/paneles/panel-investigador';
import { PanelVoluntario } from './components/paneles/panel-voluntario';
import { ResumenMensual } from './components/resumen-mensual/resumen-mensual';

// Rutas de historial, paneles y reportes
export const rutasPaneles: Routes = [
  { path: 'historial', component: Historial, canActivate: [authGuard], title: 'Historial | FaunaScan Perú' },
  { path: 'avistamientos/:id', component: DetalleAvistamiento, canActivate: [authGuard], title: 'Detalle de avistamiento | FaunaScan Perú' },
  { path: 'panel/voluntario', component: PanelVoluntario, canActivate: [authGuard], title: 'Panel del voluntario | FaunaScan Perú' },
  { path: 'panel/investigador', component: PanelInvestigador, canActivate: [investigadorGuard], title: 'Panel del investigador | FaunaScan Perú' },
  { path: 'resumen', component: ResumenMensual, canActivate: [investigadorGuard], title: 'Resumen mensual | FaunaScan Perú' },
  { path: 'mi-contribucion', component: MiContribucion, canActivate: [authGuard], title: 'Mi contribución | FaunaScan Perú' },
];
