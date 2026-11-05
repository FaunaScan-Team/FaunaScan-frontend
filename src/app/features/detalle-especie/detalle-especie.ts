import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ESPECIES } from '../../data/especies.mock';
@Component({ selector: 'app-detalle-especie', standalone: true, imports: [RouterLink], templateUrl: './detalle-especie.html', styleUrl: './detalle-especie.css' })
export class DetalleEspecieComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly parametros = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly especie = computed(() => ESPECIES.find(item => String(item.id) === this.parametros().get('id')));
  readonly familias = { mamifero: 'Mamífero', ave: 'Ave', reptil: 'Reptil' };
}
