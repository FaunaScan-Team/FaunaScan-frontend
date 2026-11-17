import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Avistamiento, EstadoValidacion } from '../../models/avistamiento';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';

@Component({
  selector: 'app-detalle-verificacion',
  imports: [DatePipe, RouterLink],
  templateUrl: './detalle-verificacion.html',
  styleUrl: './detalle-verificacion.css',
})
export class DetalleVerificacion {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly avistamientosService = inject(AvistamientosService);
  private readonly sesionService = inject(SesionConsultaService);

  error = '';
  usuarioEmail = this.sesionService.usuarioActual()?.email ?? '';

  get avistamiento(): Avistamiento | null {
    const id = this.ruta.snapshot.paramMap.get('id');
    return id ? this.avistamientosService.obtenerPorId(id) ?? null : null;
  }

  resolver(estado: Exclude<EstadoValidacion, 'Pendiente'>): void {
    this.error = '';
    const usuario = this.sesionService.usuarioActual();
    const registro = this.avistamiento;
    if (!usuario || !registro || !this.avistamientosService.validar(registro.id, estado, usuario)) {
      this.error = 'No fue posible registrar la validación. Comprueba el estado y tu sesión.';
      return;
    }
    void this.router.navigate(['/verificar']);
  }

  urlMapa(latitud: number, longitud: number): string {
    return `https://www.openstreetmap.org/?mlat=${latitud}&mlon=${longitud}#map=13/${latitud}/${longitud}`;
  }
}
