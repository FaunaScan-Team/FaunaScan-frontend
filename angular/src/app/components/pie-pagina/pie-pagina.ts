import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IdiomaService } from '../../servicios/idioma.service';

@Component({
  selector: 'app-pie-pagina',
  imports: [RouterLink],
  templateUrl: './pie-pagina.html',
  styleUrl: './pie-pagina.css',
})
export class PiePagina {
  idioma: IdiomaService = inject(IdiomaService);
}