import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Menu } from './components/menu/menu';
import { PiePagina } from './components/pie-pagina/pie-pagina';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, PiePagina],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  /**
   * Las pantallas internas (historial, detalle, y las que vengan después)
   * traen su propio sidebar, así que no llevan la navbar ni el pie del
   * sitio público. Lo indican con data.shell = 'panel' en app.routes.ts.
   */
  private readonly shell = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let ruta = this.ruta.firstChild;
        while (ruta?.firstChild) ruta = ruta.firstChild;
        return (ruta?.snapshot.data['shell'] as string | undefined) ?? 'publico';
      }),
    ),
    { initialValue: 'publico' },
  );

  protected readonly shellPublico = computed(() => this.shell() !== 'panel');
}
