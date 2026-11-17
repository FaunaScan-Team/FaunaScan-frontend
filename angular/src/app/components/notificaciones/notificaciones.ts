import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoriaNotificacion, Notificacion } from '../../models/notificacion';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { NotificacionesService } from '../../servicios/notificaciones.service';
import { PreferenciasNotificacionesService } from '../../servicios/preferencias-notificaciones.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';

@Component({
  selector: 'app-notificaciones',
  imports: [DatePipe, RouterLink],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class Notificaciones implements OnInit {
  private readonly avistamientosService = inject(AvistamientosService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly preferenciasService = inject(PreferenciasNotificacionesService);
  private readonly sesionService = inject(SesionConsultaService);

  email = '';
  filtro: 'todas' | CategoriaNotificacion = 'todas';
  leidas: string[] = [];
  error = false;

  readonly filtros: { valor: 'todas' | CategoriaNotificacion; texto: string }[] = [
    { valor: 'todas', texto: 'Todas' },
    { valor: 'criticas', texto: 'Críticas' },
    { valor: 'sistema', texto: 'Sistema' },
    { valor: 'alertas', texto: 'Alertas' },
  ];

  ngOnInit(): void {
    this.email = this.sesionService.usuarioActual()?.email ?? '';
    this.leidas = this.notificacionesService.leerIdsLeidos(this.email);
  }

  /** Lista derivada de los avistamientos; el backend de notificaciones aún no existe. */
  get notificaciones(): Notificacion[] {
    return this.notificacionesService.generar(
      this.avistamientosService.lista(),
      this.email,
      this.preferenciasService.obtener(this.email),
    );
  }

  get visibles(): Notificacion[] {
    return this.notificaciones.filter(
      (notificacion) => this.filtro === 'todas' || notificacion.categoria === this.filtro,
    );
  }

  contar(categoria: CategoriaNotificacion): number {
    return this.notificaciones.filter((item) => item.categoria === categoria).length;
  }

  marcarLeida(id: string): void {
    const ids = Array.from(new Set([...this.leidas, id]));
    if (!this.notificacionesService.guardarIdsLeidos(this.email, ids)) {
      this.error = true;
      return;
    }
    this.leidas = ids;
    this.error = false;
  }
}
