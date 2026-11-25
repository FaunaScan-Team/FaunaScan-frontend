import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Menu } from './components/menu/menu';
import { PiePagina } from './components/pie-pagina/pie-pagina';
import { IndicadorConexion } from './components/indicador-conexion/indicador-conexion';
import { BarraLateral } from './components/barra-lateral/barra-lateral';
import { AuthService } from './servicios/auth.service';

// Pantallas sin menú ni pie de página (login, registro...)
const RUTAS_PANTALLA_COMPLETA = ['/login', '/registro', '/recuperar', '/verificacion-investigador', '/bienvenida'];
// Pantallas públicas que conservan el menú superior aunque haya sesión
const RUTAS_PUBLICAS = ['/', '/terminos'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Menu, PiePagina, IndicadorConexion, BarraLateral],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  private authService = inject(AuthService);
  protected readonly pantallaCompleta = signal(false);
  // Con sesión iniciada la app usa la barra lateral del prototipo (FaunaScan/FaunaScan, dashboard.html)
  protected readonly conBarraLateral = signal(false);
  protected readonly barraAbierta = signal(false);

  constructor() {
    this.router.events.pipe(filter(evento => evento instanceof NavigationEnd)).subscribe(() => {
      const ruta = this.router.url.split('?')[0].split('#')[0];
      const completa = RUTAS_PANTALLA_COMPLETA.includes(ruta);
      this.pantallaCompleta.set(completa);
      this.conBarraLateral.set(!completa && !RUTAS_PUBLICAS.includes(ruta) && this.authService.estaLogueado());
      this.barraAbierta.set(false);
    });
  }
}
