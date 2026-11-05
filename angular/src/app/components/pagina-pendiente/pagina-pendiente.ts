import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Soporte de integración. Cada integrante reemplazará su ruta por su componente real.
@Component({
  selector: 'app-pagina-pendiente',
  imports: [RouterLink],
  templateUrl: './pagina-pendiente.html',
  styleUrl: './pagina-pendiente.css',
})
export class PaginaPendiente {
  protected readonly ruta = inject(ActivatedRoute);
}
