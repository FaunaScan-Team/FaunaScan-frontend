import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Página temporal para las secciones que todavía no están disponibles
@Component({
  selector: 'app-pagina-pendiente',
  imports: [RouterLink],
  templateUrl: './pagina-pendiente.html',
  styleUrl: './pagina-pendiente.css',
})
export class PaginaPendiente {
  protected readonly ruta = inject(ActivatedRoute);
}
