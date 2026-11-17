import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { PaginaPendiente } from './components/pagina-pendiente/pagina-pendiente';
import { Registrar } from './components/registrar/registrar';
import { Observaciones } from './components/observaciones/observaciones';
import { rutasNohelia } from './nohelia.routes';
import { rutasPaneles } from './paneles.routes';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Recuperar } from './components/recuperar/recuperar';
import { VerificacionInvestigador } from './components/verificacion-investigador/verificacion-investigador';
import { Perfil } from './components/perfil/perfil';
import { MapaComponent } from './components/mapa/mapa.component';

export const routes: Routes = [
  { path: '', component: Inicio, title: 'Inicio | FaunaScan Perú' },
  { path: 'login', component: Login, title: 'Iniciar sesión | FaunaScan Perú' },
  { path: 'registro', component: Registro, title: 'Crear cuenta | FaunaScan Perú' },
  { path: 'recuperar', component: Recuperar, title: 'Recuperar contraseña | FaunaScan Perú' },
  { path: 'verificacion-investigador', component: VerificacionInvestigador, title: 'Verificación | FaunaScan Perú' },
  { path: 'perfil', component: Perfil, title: 'Mi perfil | FaunaScan Perú' },
  { path: 'mapa', component: MapaComponent, title: 'Mapa | FaunaScan Perú' },
  { path: 'catalogo', component: PaginaPendiente, title: 'Catálogo | FaunaScan Perú', data: { titulo: 'Catálogo de especies', responsable: 'Estefany' } },
  { path: 'catalogo/:id', component: PaginaPendiente, title: 'Especie | FaunaScan Perú', data: { titulo: 'Detalle de especie', responsable: 'Estefany' } },
  { path: 'registrar', component: Registrar, title: 'Registrar | FaunaScan Perú' },
  { path: 'observaciones', component: Observaciones, title: 'Observaciones | FaunaScan Perú' },
  ...rutasPaneles,
  ...rutasNohelia,
  { path: '**', redirectTo: '' },
];
