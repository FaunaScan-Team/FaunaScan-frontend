import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EstadoValidacion } from '../../models/avistamiento';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';

@Component({
  selector: 'app-detalle-verificacion',
  imports: [DatePipe, RouterLink],
  template: `
    <section class="nohe-page" aria-labelledby="det-title">
      <div class="nohe-heading"><div><p class="nohe-eyebrow">Revisión científica</p><h1 id="det-title">Detalle de verificación</h1>
        <p class="nohe-subtitle">Examina la información antes de decidir.</p></div>
        <a class="nohe-btn nohe-btn--outline" routerLink="/verificar">← Volver a pendientes</a></div>
      @if (error()) { <p class="nohe-error" role="alert">{{ error() }}</p> }
      @if (avistamiento(); as av) {
        <div class="nohe-columns">
          <article class="nohe-card nohe-aside">
            <div class="nohe-foto" role="img" aria-label="No hay fotografía adjunta al registro Angular">{{ av.especie.emoji || '🐾' }}</div>
            <p class="nohe-muted">La fotografía se integrará cuando esté disponible el módulo «Adjuntar foto».</p>
            <h2>Ubicación del avistamiento</h2>
            <p>📍 {{ av.area }}</p>
            @if (av.latitud !== null && av.longitud !== null) {
              <p>Latitud: <strong>{{ av.latitud }}</strong></p>
              <p>Longitud: <strong>{{ av.longitud }}</strong></p>
              <a class="nohe-link" [href]="urlMapa(av.latitud, av.longitud)" target="_blank" rel="noopener noreferrer">Ver en OpenStreetMap ↗</a>
            } @else { <p class="nohe-muted">Este registro no incluye coordenadas.</p> }
          </article>
          <article class="nohe-card nohe-aside">
            <span class="nohe-badge" [class.nohe-badge--pending]="av.estadoValidacion === 'Pendiente'">{{ av.estadoValidacion }}</span>
            <h2>{{ av.especie.nombre }}</h2>
            <p class="nohe-muted"><em>{{ av.especie.nombreCientifico }}</em></p>
            <p><strong>Registrado por:</strong> {{ av.registradoPor?.nombre || 'Usuario no identificado' }}</p>
            <p><strong>Fecha:</strong> {{ av.fecha | date:'dd/MM/yyyy HH:mm' }}</p>
            <p><strong>Descripción:</strong> {{ av.descripcion || 'Sin descripción' }}</p>
            <h3>Observaciones</h3>
            @if (av.observaciones; as obs) {
              <div class="nohe-metrics"><div>Clima<strong>{{ obs.clima || '—' }}</strong></div>
                <div>Temperatura<strong>{{ obs.temperatura ?? '—' }} °C</strong></div>
                <div>Humedad<strong>{{ obs.humedad ?? '—' }} %</strong></div>
                <div>Individuos<strong>{{ obs.individuos ?? '—' }}</strong></div></div>
              <p>{{ obs.notas || 'Sin notas adicionales.' }}</p>
              <div class="nohe-chips">@for (etiqueta of obs.etiquetas; track etiqueta) { <span class="nohe-badge">{{ etiqueta }}</span> }</div>
            } @else { <p class="nohe-muted">Sin observaciones adicionales.</p> }
            @if (av.estadoValidacion === 'Pendiente' && av.registradoPor?.email.toLowerCase() !== usuarioEmail) {
              <div class="nohe-actions">
                <button type="button" class="nohe-btn nohe-btn--primary" (click)="resolver('Validado')">Validar</button>
                <button type="button" class="nohe-btn nohe-btn--danger" (click)="resolver('Rechazado')">Rechazar</button>
              </div>
            } @else {
              <p class="nohe-note">Este registro no admite nuevas validaciones: ya fue resuelto o pertenece al investigador actual.</p>
              @if (av.validadoPor) { <p><strong>Validado por:</strong> {{ av.validadoPor }}</p> }
              @if (av.validadoEn) { <p><strong>Fecha de validación:</strong> {{ av.validadoEn | date:'dd/MM/yyyy HH:mm' }}</p> }
            }
          </article>
        </div>
      } @else {
        <div class="nohe-empty">No se encontró el avistamiento solicitado. <a routerLink="/verificar">Volver a la cola</a>.</div>
      }
    </section>
  `,
  styleUrl: './nohelia.css',
})
export class DetalleVerificacion {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicio = inject(AvistamientosService);
  private readonly sesion = inject(SesionConsultaService);
  protected readonly usuarioEmail = this.sesion.usuarioActual()?.email ?? '';
  protected readonly error = signal('');
  private readonly parametros = toSignal(this.ruta.paramMap, { initialValue: this.ruta.snapshot.paramMap });
  protected readonly avistamiento = computed(() => {
    const id = this.parametros().get('id');
    return id ? this.servicio.lista().find((av) => av.id === id) ?? null : null;
  });

  protected resolver(estado: Exclude<EstadoValidacion, 'Pendiente'>): void {
    this.error.set('');
    const usuario = this.sesion.usuarioActual();
    const av = this.avistamiento();
    if (!usuario || !av || !this.servicio.validar(av.id, estado, usuario)) {
      this.error.set('No fue posible registrar la validación. Comprueba el estado y tu sesión.');
      return;
    }
    void this.router.navigate(['/verificar']);
  }

  protected urlMapa(lat: number, lon: number): string {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`;
  }
}
