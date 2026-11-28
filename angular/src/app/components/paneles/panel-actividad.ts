import {DatePipe} from '@angular/common';
import {Component, computed, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ActividadRecienteApi} from '../../servicios/actividades-api.service';

// HU-21: actividad reciente de otros usuarios, compartida por los dos paneles
@Component({
  selector: 'app-panel-actividad',
  imports: [DatePipe, RouterLink],
  templateUrl: './panel-actividad.html',
  styleUrl: './panel-actividad.css',
})
export class PanelActividad {
  readonly recientes = input.required<ActividadRecienteApi[]>();
  readonly cantidad = input(3);

  protected readonly visibles = computed(() => this.recientes().slice(0, this.cantidad()));

  protected iniciales(nombre: string, apellido: string): string {
    return ((nombre || '').charAt(0) + (apellido || '').charAt(0)).toUpperCase() || '?';
  }
}
