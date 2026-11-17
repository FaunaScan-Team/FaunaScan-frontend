import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avistamiento } from '../../models/avistamiento';
import { AvistamientosService } from '../../servicios/avistamientos.service';

@Component({
  selector: 'app-actividades-recientes',
  imports: [DatePipe, RouterLink],
  templateUrl: './actividades-recientes.html',
  styleUrl: './actividades-recientes.css',
})
export class ActividadesRecientes {
  private readonly avistamientosService = inject(AvistamientosService);
  idSeleccionado: string | null = null;

  get registros(): Avistamiento[] {
    return [...this.avistamientosService.lista()].sort(
      (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(),
    );
  }

  get seleccionado(): Avistamiento | null {
    return this.registros.find((av) => av.id === this.idSeleccionado)
      ?? this.registros[0]
      ?? null;
  }

  seleccionar(avistamiento: Avistamiento): void {
    this.idSeleccionado = avistamiento.id;
  }

  urlMapa(avistamiento: Avistamiento): string {
    if (avistamiento.latitud === null || avistamiento.longitud === null) {
      return 'https://www.openstreetmap.org/';
    }
    const lat = encodeURIComponent(String(avistamiento.latitud));
    const lon = encodeURIComponent(String(avistamiento.longitud));
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`;
  }
}
