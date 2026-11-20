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
import { authGuard, investigadorGuard } from './guards/auth.guard';
import { Catalogo } from './components/catalogo/catalogo';
import { DetalleEspecie } from './components/detalle-especie/detalle-especie';
import { SeleccionarEspecieComponent } from './components/seleccionar-especie/seleccionar-especie.component';
import { IdentificarIaComponent } from './components/identificar-ia/identificar-ia.component';
import { Bienvenida } from './components/bienvenida/bienvenida';
export const routes: Routes = [
  { path: '', component: Inicio, title: 'Inicio | FaunaScan Perú' },
  { path: 'login', component: Login, title: 'Iniciar sesión | FaunaScan Perú' },
  { path: 'registro', component: Registro, title: 'Crear cuenta | FaunaScan Perú' },
  { path: 'recuperar', component: Recuperar, title: 'Recuperar contraseña | FaunaScan Perú' },
  { path: 'verificacion-investigador', component: VerificacionInvestigador, canActivate: [investigadorGuard], title: 'Verificación | FaunaScan Perú' },
  { path: 'bienvenida', component: Bienvenida, canActivate: [authGuard], title: 'Bienvenida | FaunaScan Perú' },
  { path: 'perfil', component: Perfil, canActivate: [authGuard], title: 'Mi perfil | FaunaScan Perú' },
  { path: 'mapa', component: MapaComponent, canActivate: [authGuard], title: 'Mapa | FaunaScan Perú' },
  { path: 'catalogo', component: Catalogo, canActivate: [authGuard], title: 'Catálogo | FaunaScan Perú' },
  { path: 'catalogo/:id', component: DetalleEspecie, canActivate: [authGuard], title: 'Especie | FaunaScan Perú' },
  { path: 'seleccionar-especie', component: SeleccionarEspecieComponent, canActivate: [authGuard], title: 'Seleccionar especie | FaunaScan Perú' },
  { path: 'identificar-ia', component: IdentificarIaComponent, canActivate: [authGuard], title: 'Identificar con IA | FaunaScan Perú' },
  { path: 'registrar', component: Registrar, canActivate: [authGuard], title: 'Registrar | FaunaScan Perú' },
  { path: 'observaciones', component: Observaciones, canActivate: [authGuard], title: 'Observaciones | FaunaScan Perú' },
  ...rutasPaneles,
  ...rutasValidacion,
  { path: '**', redirectTo: '' },
];
