import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Pantalla informativa que se muestra cuando el usuario no tiene
 * autorización para acceder a una funcionalidad de FaunaScan.
 *
 * La validación de permisos y la redirección hacia esta ruta se
 * implementarán más adelante en la configuración general del proyecto.
 */
@Component({
  selector: 'app-acceso-restringido',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './acceso-restringido.html',
  styleUrls: ['./acceso-restringido.css']
})
export class AccesoRestringido {
  readonly titulo = 'Esta sección es exclusiva para investigadores verificados';

  readonly mensaje =
    'La validación de avistamientos requiere una credencial institucional verificada. ' +
    'Si eres investigador, verifica tu credencial desde tu perfil.';

  // Ruta de Inicio acordada con el equipo.
  readonly rutaInicio = '/';
}
