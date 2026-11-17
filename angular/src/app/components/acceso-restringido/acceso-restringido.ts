import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Migración de src/app/acceso-restringido a la aplicación Angular real. */
@Component({
  selector: 'app-acceso-restringido',
  imports: [RouterLink],
  templateUrl: './acceso-restringido.html',
  styleUrl: './acceso-restringido.css',
})
export class AccesoRestringido {}
