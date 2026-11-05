import { Routes } from '@angular/router';
export const CATALOGO_ROUTES: Routes = [
  { path: 'catalogo', title: 'Catálogo | FaunaScan', loadComponent: () => import('./catalogo').then(m => m.CatalogoComponent) },
  { path: 'catalogo/:id', title: 'Detalle de especie | FaunaScan', loadComponent: () => import('../detalle-especie/detalle-especie').then(m => m.DetalleEspecieComponent) }
];
