import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { PaginaPendiente } from './components/pagina-pendiente/pagina-pendiente';
import { Historial } from './components/historial/historial';
import { DetalleAvistamiento } from './components/detalle-avistamiento/detalle-avistamiento';
import { sesionGuard } from './core/sesion-guard';

export const routes: Routes = [
  { path: '', component: Inicio, title: 'Inicio | FaunaScan Perú' },
  { path: 'catalogo', component: PaginaPendiente, title: 'Catálogo | FaunaScan Perú', data: { titulo: 'Catálogo de especies', responsable: 'Estefany' } },
  { path: 'catalogo/:id', component: PaginaPendiente, title: 'Especie | FaunaScan Perú', data: { titulo: 'Detalle de especie', responsable: 'Estefany' } },
  { path: 'registrar', component: PaginaPendiente, title: 'Registrar | FaunaScan Perú', data: { titulo: 'Registrar avistamiento', responsable: 'Sebastián Añamauro' } },
  { path: 'observaciones', component: PaginaPendiente, title: 'Observaciones | FaunaScan Perú', data: { titulo: 'Observaciones del avistamiento', responsable: 'Sebastián Añamauro' } },
  { path: 'historial', component: Historial, title: 'Historial | FaunaScan Perú', canActivate: [sesionGuard], data: { shell: 'panel' } },
  { path: 'avistamientos/:id', component: DetalleAvistamiento, title: 'Avistamiento | FaunaScan Perú', canActivate: [sesionGuard], data: { shell: 'panel' } },
  { path: 'acceso-restringido', component: PaginaPendiente, title: 'Acceso restringido | FaunaScan Perú', data: { titulo: 'Acceso restringido', responsable: 'Nohelia' } },
  { path: '**', redirectTo: '' },
];
