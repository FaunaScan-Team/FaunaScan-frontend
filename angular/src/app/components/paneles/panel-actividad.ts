import {DatePipe} from '@angular/common';
import {Component, computed, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ActividadRecienteApi} from '../../servicios/actividades-api.service';

// HU-21: actividad reciente de otros usuarios, compartida por los dos paneles
@Component({
  selector: 'app-panel-actividad',
  imports: [DatePipe, RouterLink],
  templateUrl: './panel-actividad.html',
  styleUrl: '../compartido/paneles.css',
})
export class PanelActividad {
  readonly recientes = input.required<ActividadRecienteApi[]>();
  readonly cantidad = input(6);

  protected readonly visibles = computed(() => this.recientes().slice(0, this.cantidad()));
}
