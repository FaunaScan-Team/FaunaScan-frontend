
import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ActividadesApiService,
  ActividadRecienteApi
} from '../../servicios/actividades-api.service';

@Component({
  selector: 'app-actividades-recientes',
  imports: [DatePipe, RouterLink],
  templateUrl: './actividades-recientes.html',
  styleUrl: './actividades-recientes.css',
})
export class ActividadesRecientes implements OnInit {

  private readonly actividadesApi = inject(ActividadesApiService);

  registros: ActividadRecienteApi[] = [];
  idSeleccionado: number | null = null;

  cargando = false;
  error = '';

  ngOnInit(): void {
    this.cargarActividades();
  }

  cargarActividades(): void {
    this.cargando = true;
    this.error = '';

    this.actividadesApi.obtenerRecientes().subscribe({
      next: (datos) => {
        this.registros = [...datos].sort(
          (a, b) =>
            new Date(b.fechaAvistamiento).getTime() -
            new Date(a.fechaAvistamiento).getTime()
        );

        if (!this.registros.some(
          registro => registro.idAvistamiento === this.idSeleccionado
        )) {
          this.idSeleccionado =
            this.registros[0]?.idAvistamiento ?? null;
        }

        this.cargando = false;
      },
      error: () => {
        this.registros = [];
        this.idSeleccionado = null;
        this.cargando = false;
        this.error =
          'No se pudieron cargar las actividades desde la API.';
      }
    });
  }

  get seleccionado(): ActividadRecienteApi | null {
    return this.registros.find(
      registro => registro.idAvistamiento === this.idSeleccionado
    ) ?? this.registros[0] ?? null;
  }

  seleccionar(actividad: ActividadRecienteApi): void {
    this.idSeleccionado = actividad.idAvistamiento;
  }

  nombreCompleto(actividad: ActividadRecienteApi): string {
    const nombre = [
      actividad.nombreUsuario,
      actividad.apellidoUsuario
    ].filter(Boolean).join(' ').trim();

    return nombre || 'Usuario no identificado';
  }

  urlMapa(actividad: ActividadRecienteApi): string {
    if (
      actividad.latitud == null ||
      actividad.longitud == null
    ) {
      return 'https://www.openstreetmap.org/';
    }

    const lat = encodeURIComponent(String(actividad.latitud));
    const lon = encodeURIComponent(String(actividad.longitud));

    return (
      `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}` +
      `#map=13/${lat}/${lon}`
    );
  }
}
