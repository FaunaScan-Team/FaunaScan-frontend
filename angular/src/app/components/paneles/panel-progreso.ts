import {Component, computed, input} from '@angular/core';
import {ProgresoUsuario} from '../../models/progreso-usuario';
import {calcularLogros} from '../compartido/logros';

// Bloque "Mi progreso" y "Logros", compartido por los dos paneles
@Component({
  selector: 'app-panel-progreso',
  templateUrl: './panel-progreso.html',
  styleUrl: '../compartido/paneles.css',
})
export class PanelProgreso {
  readonly progreso = input.required<ProgresoUsuario>();
  readonly validados = input(0);

  protected readonly logros = computed(() => calcularLogros(this.progreso(), this.validados()));
  protected readonly alcanzados = computed(() => this.logros().filter(logro => logro.alcanzado).length);
}
