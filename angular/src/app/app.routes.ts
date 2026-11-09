import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { PaginaPendiente } from './components/pagina-pendiente/pagina-pendiente';
import { Registrar } from './components/registrar/registrar';
import { Observaciones } from './components/observaciones/observaciones';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Recuperar } from './components/recuperar/recuperar';
import { VerificacionInvestigador } from './components/verificacion-investigador/verificacion-investigador';
import { Perfil } from './components/perfil/perfil';
import { redirigirPanel, requiereSesion } from './servicios/acceso.guard';
import { MapaComponent } from './components/mapa/mapa.component';

export const routes: Routes = [
  { path: '', component: Inicio, title: 'Inicio | FaunaScan Perú' },
  { path: 'login', component: Login, title: 'Iniciar sesión | FaunaScan Perú' },
  { path: 'registro', component: Registro, title: 'Crear cuenta | FaunaScan Perú' },
  { path: 'recuperar', component: Recuperar, title: 'Recuperar contraseña | FaunaScan Perú' },
  { path: 'verificacion-investigador', component: VerificacionInvestigador, canActivate: [requiereSesion], title: 'Verificación | FaunaScan Perú' },
  { path: 'perfil', component: Perfil, canActivate: [requiereSesion], title: 'Mi perfil | FaunaScan Perú' },
  { path: 'dashboard', component: PaginaPendiente, canActivate: [redirigirPanel] },
  { path: 'dashboard-investigador', component: PaginaPendiente, canActivate: [requiereSesion], title: 'Panel de investigador | FaunaScan Perú', data: { titulo: 'Panel de investigador', responsable: 'Sebastián Suarez' } },
  { path: 'dashboard-voluntario', component: PaginaPendiente, canActivate: [requiereSesion], title: 'Panel de voluntario | FaunaScan Perú', data: { titulo: 'Panel de voluntario', responsable: 'Sebastián Suarez' } },
  { path: 'mapa', component: MapaComponent, title: 'Mapa | FaunaScan Perú' },
  { path: 'reportes', component: PaginaPendiente, title: 'Reportes | FaunaScan Perú', data: { titulo: 'Reportes', responsable: 'Sebastián Añamauro' } },
  { path: 'catalogo', component: PaginaPendiente, title: 'Catálogo | FaunaScan Perú', data: { titulo: 'Catálogo de especies', responsable: 'Estefany' } },
  { path: 'catalogo/:id', component: PaginaPendiente, title: 'Especie | FaunaScan Perú', data: { titulo: 'Detalle de especie', responsable: 'Estefany' } },
  { path: 'registrar', component: Registrar, title: 'Registrar | FaunaScan Perú' },
  { path: 'observaciones', component: Observaciones, title: 'Observaciones | FaunaScan Perú' },
  { path: 'historial', component: PaginaPendiente, title: 'Historial | FaunaScan Perú', data: { titulo: 'Historial de avistamientos', responsable: 'Sebastián Suarez' } },
  { path: 'avistamientos/:id', component: PaginaPendiente, title: 'Avistamiento | FaunaScan Perú', data: { titulo: 'Detalle de avistamiento', responsable: 'Sebastián Suarez' } },
  { path: 'acceso-restringido', component: PaginaPendiente, title: 'Acceso restringido | FaunaScan Perú', data: { titulo: 'Acceso restringido', responsable: 'Nohelia' } },
  { path: '**', redirectTo: '' },
];
