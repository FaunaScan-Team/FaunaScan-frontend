import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { PaginaPendiente } from './components/pagina-pendiente/pagina-pendiente';
import { Registrar } from './components/registrar/registrar';
import { Observaciones } from './components/observaciones/observaciones';
import { rutasValidacion } from './validacion.routes';
import { rutasPaneles } from './paneles.routes';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Recuperar } from './components/recuperar/recuperar';
import { VerificacionInvestigador } from './components/verificacion-investigador/verificacion-investigador';
import { Perfil } from './components/perfil/perfil';
import { MapaComponent } from './components/mapa/mapa.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Inicio, title: 'Inicio | FaunaScan Perú' },
  { path: 'login', component: Login, title: 'Iniciar sesión | FaunaScan Perú' },
  { path: 'registro', component: Registro, title: 'Crear cuenta | FaunaScan Perú' },
  { path: 'recuperar', component: Recuperar, title: 'Recuperar contraseña | FaunaScan Perú' },
  { path: 'verificacion-investigador', component: VerificacionInvestigador, canActivate: [authGuard], title: 'Verificación | FaunaScan Perú' },
  { path: 'perfil', component: Perfil, canActivate: [authGuard], title: 'Mi perfil | FaunaScan Perú' },
  { path: 'mapa', component: MapaComponent, canActivate: [authGuard], title: 'Mapa | FaunaScan Perú' },
  { path: 'catalogo', component: PaginaPendiente, canActivate: [authGuard], title: 'Catálogo | FaunaScan Perú', data: { titulo: 'Catálogo de especies' } },
  { path: 'catalogo/:id', component: PaginaPendiente, canActivate: [authGuard], title: 'Especie | FaunaScan Perú', data: { titulo: 'Detalle de especie' } },
  { path: 'registrar', component: Registrar, canActivate: [authGuard], title: 'Registrar | FaunaScan Perú' },
  { path: 'observaciones', component: Observaciones, canActivate: [authGuard], title: 'Observaciones | FaunaScan Perú' },
  ...rutasPaneles,
  ...rutasValidacion,
  { path: '**', redirectTo: '' },
];
