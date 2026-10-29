import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  protected readonly abierto = signal(false);
  protected readonly enlaces = [
    { ruta: '/', texto: 'Inicio' },
    { ruta: '/catalogo', texto: 'Catálogo' },
    { ruta: '/registrar', texto: 'Registrar avistamiento' },
    { ruta: '/historial', texto: 'Historial' },
  ];

  protected alternarMenu(): void {
    this.abierto.update((valor) => !valor);
  }

  protected cerrarMenu(): void {
    this.abierto.set(false);
  }

  @HostListener('document:keydown.escape')
  protected cerrarConEscape(): void {
    this.cerrarMenu();
  }
}
