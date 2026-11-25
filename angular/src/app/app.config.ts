import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { authInterceptor } from './servicios/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Los componentes guardan los datos de la API en propiedades normales (this.lista = data).
    // Sin zone.js Angular no se entera de esos cambios y la vista se queda en "Cargando...".
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Campos de formulario blancos con borde, como en el prototipo (FaunaScan/FaunaScan)
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    })),
    provideHttpClient(withInterceptors([authInterceptor])),
    // SA-08: service worker para que la app abra sin conexion y se pueda instalar (PWA).
    // Solo se activa en el build de produccion (ng build), no con ng serve.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
