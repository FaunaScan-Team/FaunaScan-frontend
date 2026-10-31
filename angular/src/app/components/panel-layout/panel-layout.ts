import { Component, HostListener, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface EnlacePanel {
  texto: string;
  icono: string;
  ruta: string | null; // null = pantalla todavía no migrada a Angular
}

/**
 * Cascarón de las pantallas internas (sidebar oscuro + barra superior),
 * extraído del marcado repetido en historial.html y detalle-avistamiento.html.
 *
 * El contenido de cada pantalla entra por <ng-content>. Los enlaces sin
 * ruta se muestran desactivados: sus pantallas siguen en HTML y todavía no
 * tienen componente Angular. Al migrarlas basta con poner la ruta aquí.
 */
@Component({
  selector: 'app-panel-layout',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './panel-layout.html',
  styleUrl: './panel-layout.css',
})
export class PanelLayout {
  readonly titulo = input.required<string>();

  /** Marca un enlace del sidebar como activo aunque la URL no coincida
   *  (el detalle de un avistamiento pertenece a la sección Historial). */
  readonly seccionActiva = input<string | null>(null);

  protected readonly menuAbierto = signal(false);

  protected readonly enlaces: EnlacePanel[] = [
    { texto: 'Principal', icono: 'Principal.png', ruta: null },
    { texto: 'Registrar', icono: 'Registrar.png', ruta: '/registrar' },
    { texto: 'Mapa', icono: 'Mapa.png', ruta: null },
    { texto: 'Reportes', icono: 'Reportes.png', ruta: null },
    { texto: 'Historial', icono: 'Historial.png', ruta: '/historial' },
  ];

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  @HostListener('document:keydown.escape')
  protected cerrarConEscape(): void {
    this.cerrarMenu();
  }
}
