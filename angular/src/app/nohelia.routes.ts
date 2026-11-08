import { Routes } from '@angular/router';
import { sesionRequeridaGuard, investigadorVerificadoGuard } from './guards/nohelia.guards';
import { AccesoRestringido } from './components/nohelia/acceso-restringido';
import { Notificaciones } from './components/nohelia/notificaciones';
import { ConfiguracionNotificaciones } from './components/nohelia/configuracion-notificaciones';
import { ActividadesRecientes } from './components/nohelia/actividades-recientes';
import { VerificarAvistamientos } from './components/nohelia/verificar-avistamientos';
import { DetalleVerificacion } from './components/nohelia/detalle-verificacion';

/** Catherine debe integrar estas rutas ANTES de la ruta comodín '**'. */
export const rutasNohelia: Routes = [
  { path: 'acceso-restringido', component: AccesoRestringido, title: 'Acceso restringido | FaunaScan Perú' },
  { path: 'notificaciones', component: Notificaciones, canActivate: [sesionRequeridaGuard], title: 'Notificaciones | FaunaScan Perú' },
  { path: 'configuracion-notificaciones', component: ConfiguracionNotificaciones, canActivate: [sesionRequeridaGuard], title: 'Configuración de notificaciones | FaunaScan Perú' },
  { path: 'actividades', component: ActividadesRecientes, canActivate: [sesionRequeridaGuard], title: 'Actividades recientes | FaunaScan Perú' },
  { path: 'verificar', component: VerificarAvistamientos, canActivate: [investigadorVerificadoGuard], title: 'Verificar avistamientos | FaunaScan Perú' },
  { path: 'verificar/:id', component: DetalleVerificacion, canActivate: [investigadorVerificadoGuard], title: 'Detalle de verificación | FaunaScan Perú' },
];
