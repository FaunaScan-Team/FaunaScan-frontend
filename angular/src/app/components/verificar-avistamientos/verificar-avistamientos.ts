import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avistamiento, EstadoValidacion } from '../../models/avistamiento';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';

@Component({
  selector: 'app-verificar-avistamientos',
  imports: [DatePipe, RouterLink],
  templateUrl: './verificar-avistamientos.html',
  styleUrl: './verificar-avistamientos.css',
})
export class VerificarAvistamientos {
  private readonly avistamientosService = inject(AvistamientosService);
  private readonly sesionService = inject(SesionConsultaService);
  mensaje = '';
  error = '';

  get pendientes(): Avistamiento[] {
    const email = this.sesionService.usuarioActual()?.email.toLowerCase();
    return this.avistamientosService.lista().filter((av) =>
      av.estadoValidacion === 'Pendiente'
      && (!email || av.registradoPor?.email.toLowerCase() !== email),
    );
  }

  resolver(id: string, estado: Exclude<EstadoValidacion, 'Pendiente'>): void {
    this.mensaje = '';
    this.error = '';
    const usuario = this.sesionService.usuarioActual();
    if (!usuario) {
      this.error = 'Debes iniciar sesión.';
      return;
    }
    if (!this.avistamientosService.validar(id, estado, usuario)) {
      this.error = 'No fue posible validar. Revisa tu sesión y el estado del registro.';
      return;
    }
    this.mensaje = `Avistamiento ${estado === 'Validado' ? 'validado' : 'rechazado'} correctamente.`;
  }
}
