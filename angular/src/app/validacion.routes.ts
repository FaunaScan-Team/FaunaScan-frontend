import { Routes } from '@angular/router';
import { authGuard, investigadorGuard } from './guards/auth.guard';
import { AccesoRestringido } from './components/nohelia/acceso-restringido';
import { Notificaciones } from './components/nohelia/notificaciones';
import { ConfiguracionNotificaciones } from './components/nohelia/configuracion-notificaciones';
import { ActividadesRecientes } from './components/nohelia/actividades-recientes';
import { VerificarAvistamientos } from './components/nohelia/verificar-avistamientos';
import { DetalleVerificacion } from './components/nohelia/detalle-verificacion';

// Rutas de validación, notificaciones y actividad de la comunidad
export const rutasValidacion: Routes = [
  { path: 'acceso-restringido', component: AccesoRestringido, title: 'Acceso restringido | FaunaScan Perú' },
  { path: 'notificaciones', component: Notificaciones, canActivate: [authGuard], title: 'Notificaciones | FaunaScan Perú' },
  { path: 'configuracion-notificaciones', component: ConfiguracionNotificaciones, canActivate: [authGuard], title: 'Configuración de notificaciones | FaunaScan Perú' },
  { path: 'actividades', component: ActividadesRecientes, canActivate: [authGuard], title: 'Actividades recientes | FaunaScan Perú' },
  { path: 'verificar', component: VerificarAvistamientos, canActivate: [investigadorGuard], title: 'Verificar avistamientos | FaunaScan Perú' },
  { path: 'verificar/:id', component: DetalleVerificacion, canActivate: [investigadorGuard], title: 'Detalle de verificación | FaunaScan Perú' },
];
