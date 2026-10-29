import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { PaginaPendiente } from './components/pagina-pendiente/pagina-pendiente';
import { Registrar } from './components/registrar/registrar';
import { Observaciones } from './components/observaciones/observaciones';

export const routes: Routes = [
  { path: '', component: Inicio, title: 'Inicio | FaunaScan Perú' },
  { path: 'catalogo', component: PaginaPendiente, title: 'Catálogo | FaunaScan Perú', data: { titulo: 'Catálogo de especies', responsable: 'Estefany' } },
  { path: 'catalogo/:id', component: PaginaPendiente, title: 'Especie | FaunaScan Perú', data: { titulo: 'Detalle de especie', responsable: 'Estefany' } },
  { path: 'registrar', component: Registrar, title: 'Registrar | FaunaScan Perú' },
  { path: 'observaciones', component: Observaciones, title: 'Observaciones | FaunaScan Perú' },
  { path: 'historial', component: PaginaPendiente, title: 'Historial | FaunaScan Perú', data: { titulo: 'Historial de avistamientos', responsable: 'Sebastián Suarez' } },
  { path: 'avistamientos/:id', component: PaginaPendiente, title: 'Avistamiento | FaunaScan Perú', data: { titulo: 'Detalle de avistamiento', responsable: 'Sebastián Suarez' } },
  { path: 'acceso-restringido', component: PaginaPendiente, title: 'Acceso restringido | FaunaScan Perú', data: { titulo: 'Acceso restringido', responsable: 'Nohelia' } },
  { path: '**', redirectTo: '' },
];
