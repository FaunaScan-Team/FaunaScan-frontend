import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { PaginaPendiente } from './components/pagina-pendiente/pagina-pendiente';

export const routes: Routes = [
  { path: '', component: Inicio, title: 'Inicio | FaunaScan Perú' },
  { path: 'catalogo', component: PaginaPendiente, title: 'Catálogo | FaunaScan Perú', data: { titulo: 'Catálogo de especies', responsable: 'Estefany' } },
  { path: 'catalogo/:id', component: PaginaPendiente, title: 'Especie | FaunaScan Perú', data: { titulo: 'Detalle de especie', responsable: 'Estefany' } },
  { path: 'registrar', component: PaginaPendiente, title: 'Registrar | FaunaScan Perú', data: { titulo: 'Registrar avistamiento', responsable: 'Sebastián Añamauro' } },
  { path: 'observaciones', component: PaginaPendiente, title: 'Observaciones | FaunaScan Perú', data: { titulo: 'Observaciones del avistamiento', responsable: 'Sebastián Añamauro' } },
  { path: 'historial', component: PaginaPendiente, title: 'Historial | FaunaScan Perú', data: { titulo: 'Historial de avistamientos', responsable: 'Sebastián Suarez' } },
  { path: 'avistamientos/:id', component: PaginaPendiente, title: 'Avistamiento | FaunaScan Perú', data: { titulo: 'Detalle de avistamiento', responsable: 'Sebastián Suarez' } },
  { path: 'acceso-restringido', component: PaginaPendiente, title: 'Acceso restringido | FaunaScan Perú', data: { titulo: 'Acceso restringido', responsable: 'Nohelia' } },
  { path: '**', redirectTo: '' },
];
