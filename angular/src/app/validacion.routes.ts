import { Routes } from '@angular/router';
import { authGuard, investigadorGuard } from './guards/auth.guard';
import { AccesoRestringido } from './components/acceso-restringido/acceso-restringido';
import { Notificaciones } from './components/notificaciones/notificaciones';
import { ConfiguracionNotificaciones } from './components/configuracion-notificaciones/configuracion-notificaciones';
import { ActividadesRecientes } from './components/actividades-recientes/actividades-recientes';
import { DetalleVerificacion } from './components/detalle-verificacion/detalle-verificacion';

// Rutas de validación, notificaciones y actividad de la comunidad
export const rutasValidacion: Routes = [
  { path: 'acceso-restringido', component: AccesoRestringido, title: 'Acceso restringido | FaunaScan Perú' },
  { path: 'notificaciones', component: Notificaciones, canActivate: [authGuard], title: 'Notificaciones | FaunaScan Perú' },
  { path: 'configuracion-notificaciones', component: ConfiguracionNotificaciones, canActivate: [authGuard], title: 'Configuración de notificaciones | FaunaScan Perú' },
  { path: 'actividades', component: ActividadesRecientes, canActivate: [authGuard], title: 'Actividades recientes | FaunaScan Perú' },
  
{
  path: 'verificar',
  loadComponent: () =>
    import('./components/verificar-avistamientos/verificar-avistamientos')
      .then(m => m.VerificarAvistamientos),
  canActivate: [investigadorGuard],
  title: 'Verificar avistamientos | FaunaScan Perú'
},

  { path: 'verificar/:id', component: DetalleVerificacion, canActivate: [investigadorGuard], title: 'Detalle de verificación | FaunaScan Perú' },
];
