import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Menu } from './components/menu/menu';
import { PiePagina } from './components/pie-pagina/pie-pagina';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, PiePagina],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  protected readonly pantallaCompleta = signal(false);

  constructor() {
    this.router.events.pipe(filter(evento => evento instanceof NavigationEnd)).subscribe(() => {
      const ruta = this.router.url.split('?')[0];
      this.pantallaCompleta.set(['/login', '/registro', '/recuperar', '/verificacion-investigador', '/perfil'].includes(ruta));
    });
  }
}
