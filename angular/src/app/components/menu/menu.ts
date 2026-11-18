import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
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

  // HU-08: borra el token y vuelve al inicio
  protected cerrarSesion(): void {
    this.authService.logout();
    this.cerrarMenu();
    this.router.navigate(['/']);
  }

  @HostListener('document:keydown.escape')
  protected cerrarConEscape(): void {
    this.cerrarMenu();
  }
}
