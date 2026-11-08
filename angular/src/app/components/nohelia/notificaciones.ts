import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoriaNotificacion } from '../../models/notificacion';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { NotificacionesService } from '../../servicios/notificaciones.service';
import { PreferenciasNotificacionesService } from '../../servicios/preferencias-notificaciones.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';

@Component({
  selector: 'app-notificaciones',
  imports: [DatePipe, RouterLink],
  template: `
    <section class="nohe-page" aria-labelledby="notif-title">
      <div class="nohe-heading">
        <div><p class="nohe-eyebrow">Centro de avisos</p><h1 id="notif-title">Notificaciones</h1>
          <p class="nohe-subtitle">Consulta novedades derivadas de tus registros de fauna.</p></div>
        <a routerLink="/configuracion-notificaciones" class="nohe-btn nohe-btn--outline">⚙ Configurar</a>
      </div>
      <p class="nohe-demo">Datos locales del prototipo. Los avisos de sistema y especies críticas se incorporarán cuando existan eventos verificables.</p>
      <div class="nohe-summary" aria-label="Resumen de notificaciones">
        <div class="nohe-stat"><strong>{{ contar('criticas') }}</strong><span>Críticas</span></div>
        <div class="nohe-stat"><strong>{{ contar('sistema') }}</strong><span>Sistema</span></div>
        <div class="nohe-stat"><strong>{{ contar('alertas') }}</strong><span>Alertas</span></div>
      </div>
      <div class="nohe-tabs" role="group" aria-label="Filtrar notificaciones">
        @for (opcion of filtros; track opcion.valor) {
          <button type="button" class="nohe-tab" [class.nohe-tab--active]="filtro() === opcion.valor"
            [attr.aria-pressed]="filtro() === opcion.valor" (click)="filtro.set(opcion.valor)">{{ opcion.texto }}</button>
        }
      </div>
      @if (visibles().length === 0) {
        <div class="nohe-empty" role="status">No hay notificaciones para este filtro.</div>
      } @else {
        <ul class="nohe-list" aria-label="Notificaciones recibidas">
          @for (notif of visibles(); track notif.id) {
            <li class="nohe-card nohe-notif" [class.nohe-notif--unread]="!leidas().includes(notif.id)">
              <span class="nohe-avatar" aria-hidden="true">{{ notif.titulo.includes('validado') ? '✅' : '📋' }}</span>
              <div class="nohe-grow">
                <div class="nohe-row"><strong>{{ notif.titulo }}</strong><span class="nohe-badge">Alerta</span></div>
                <p>{{ notif.descripcion }}</p>
                <small>{{ notif.fecha | date:'dd/MM/yyyy HH:mm' }}</small>
                <div class="nohe-actions nohe-actions--small"><a [routerLink]="['/avistamientos', notif.avistamientoId]">Ver avistamiento</a>
                  @if (!leidas().includes(notif.id)) {
                    <button type="button" class="nohe-link" (click)="marcarLeida(notif.id)">Marcar como leída</button>
                  }
                </div>
              </div>
            </li>
          }
        </ul>
      }
      @if (error()) { <p class="nohe-error" role="alert">No se pudo guardar el estado de lectura en este navegador.</p> }
    </section>
  `,
  styleUrl: './nohelia.css',
})
export class Notificaciones {
  private readonly avistamientos = inject(AvistamientosService);
  private readonly sesion = inject(SesionConsultaService);
  private readonly preferencias = inject(PreferenciasNotificacionesService);
  private readonly servicio = inject(NotificacionesService);
  private readonly email = this.sesion.usuarioActual()?.email ?? '';
  protected readonly filtro = signal<'todas' | CategoriaNotificacion>('todas');
  protected readonly leidas = signal<string[]>(this.servicio.leerIdsLeidos(this.email));
  protected readonly error = signal(false);
  protected readonly filtros: readonly { valor: 'todas' | CategoriaNotificacion; texto: string }[] = [
    { valor: 'todas', texto: 'Todas' }, { valor: 'criticas', texto: 'Críticas' },
    { valor: 'sistema', texto: 'Sistema' }, { valor: 'alertas', texto: 'Alertas' },
  ];
  protected readonly notificaciones = computed(() => this.servicio.generar(
    this.avistamientos.lista(), this.email, this.preferencias.obtener(this.email),
  ));
  protected readonly visibles = computed(() => this.notificaciones().filter(
    (n) => this.filtro() === 'todas' || n.categoria === this.filtro(),
  ));

  protected contar(categoria: CategoriaNotificacion): number {
    return this.notificaciones().filter((n) => n.categoria === categoria).length;
  }

  protected marcarLeida(id: string): void {
    const ids = Array.from(new Set([...this.leidas(), id]));
    if (!this.servicio.guardarIdsLeidos(this.email, ids)) {
      this.error.set(true);
      return;
    }
    this.error.set(false);
    this.leidas.set(ids);
  }
}
