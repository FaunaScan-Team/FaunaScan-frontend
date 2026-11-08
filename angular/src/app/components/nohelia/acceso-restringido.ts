import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Migración de src/app/acceso-restringido a la aplicación Angular real. */
@Component({
  selector: 'app-acceso-restringido',
  imports: [RouterLink],
  template: `
    <section class="nohe-page nohe-access" aria-labelledby="nohe-acceso-title">
      <div class="nohe-access__icon" aria-hidden="true">🔒</div>
      <h1 id="nohe-acceso-title">Acceso restringido</h1>
      <h2>Esta sección es exclusiva para investigadores verificados</h2>
      <p>La validación de avistamientos requiere una credencial institucional verificada.
         Si eres investigador, verifica tu credencial desde tu perfil.</p>
      <div class="nohe-actions">
        <a class="nohe-btn nohe-btn--primary" routerLink="/">Volver al inicio</a>
      </div>
    </section>
  `,
  styleUrl: './nohelia.css',
})
export class AccesoRestringido {}
