import {Component, inject} from '@angular/core';
import {ColaOfflineService} from '../../servicios/cola-offline.service';

// Barra que avisa cuando no hay conexión y cuántos avistamientos faltan sincronizar.
@Component({
  selector: 'app-indicador-conexion',
  templateUrl: './indicador-conexion.html',
  styleUrl: './indicador-conexion.css',
})
export class IndicadorConexion {
  protected readonly cola = inject(ColaOfflineService);
}
