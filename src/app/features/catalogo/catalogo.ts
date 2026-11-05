import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ESPECIES } from '../../data/especies.mock';
import { Especie } from '../../models/especie';

@Component({ selector: 'app-catalogo', standalone: true, imports: [RouterLink], templateUrl: './catalogo.html', styleUrl: './catalogo.css' })
export class CatalogoComponent {
  readonly especies = ESPECIES;
  readonly busqueda = signal('');
  readonly estado = signal('');
  readonly seleccionada = signal<Especie | null>(null);
  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
  readonly especiesFiltradas = computed(() => {
    const consulta = this.normalizar(this.busqueda());
    return this.especies.filter(especie =>
      this.normalizar(especie.nombre + ' ' + especie.nombreCientifico).includes(consulta) &&
      (!this.estado() || especie.estado === this.estado())
    );
  });
  seleccionar(especie: Especie): void { this.seleccionada.set(especie); }
  limpiar(): void { this.busqueda.set(''); this.estado.set(''); this.seleccionada.set(null); }
}
