import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstadoValidacion } from '../../models/avistamiento';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';

@Component({
  selector: 'app-verificar-avistamientos',
  imports: [DatePipe, RouterLink],
  template: `
    <section class="nohe-page" aria-labelledby="ver-title">
      <div class="nohe-heading"><div><p class="nohe-eyebrow">Panel del investigador</p><h1 id="ver-title">Verificar avistamientos</h1>
        <p class="nohe-subtitle">Revisa los registros pendientes de otros usuarios.</p></div>
        <span class="nohe-counter">{{ pendientes().length }} pendientes</span></div>
      <p class="nohe-demo">Validaciones locales de demostración. La autorización real deberá comprobarse en el backend.</p>
      @if (mensaje()) { <p class="nohe-success" role="status">{{ mensaje() }}</p> }
      @if (error()) { <p class="nohe-error" role="alert">{{ error() }}</p> }
      @if (pendientes().length === 0) {
        <div class="nohe-empty">No hay avistamientos pendientes de verificación. Los nuevos registros aparecerán aquí.</div>
      } @else {
        <ul class="nohe-list">
          @for (av of pendientes(); track av.id) {
            <li class="nohe-card nohe-sighting">
              <span class="nohe-avatar nohe-avatar--large" aria-hidden="true">{{ av.especie.emoji || '🐾' }}</span>
              <div class="nohe-grow"><h2>{{ av.especie.nombre }}</h2>
                <p class="nohe-muted"><em>{{ av.especie.nombreCientifico }}</em></p>
                <small>📍 {{ av.area }} · {{ av.fecha | date:'dd/MM/yyyy HH:mm' }}</small>
                <small>Registrado por {{ av.registradoPor?.nombre || 'Usuario no identificado' }}</small>
                @if (av.descripcion) { <p class="nohe-description">{{ av.descripcion }}</p> }
              </div>
              <div class="nohe-verification-buttons"><span class="nohe-badge nohe-badge--pending">Pendiente</span>
                <a class="nohe-btn nohe-btn--outline" [routerLink]="['/verificar', av.id]">Ver detalle</a>
                <button type="button" class="nohe-btn nohe-btn--primary" (click)="resolver(av.id, 'Validado')">Validar</button>
                <button type="button" class="nohe-btn nohe-btn--danger" (click)="resolver(av.id, 'Rechazado')">Rechazar</button>
              </div>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styleUrl: './nohelia.css',
})
export class VerificarAvistamientos {
  private readonly servicio = inject(AvistamientosService);
  private readonly sesion = inject(SesionConsultaService);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');
  protected readonly pendientes = computed(() => {
    const email = this.sesion.usuarioActual()?.email;
    return this.servicio.lista().filter((av) => av.estadoValidacion === 'Pendiente'
      && (!email || av.registradoPor?.email.toLowerCase() !== email.toLowerCase()));
  });

  protected resolver(id: string, estado: Exclude<EstadoValidacion, 'Pendiente'>): void {
    this.mensaje.set(''); this.error.set('');
    const usuario = this.sesion.usuarioActual();
    if (!usuario) { this.error.set('Debes iniciar sesión.'); return; }
    const resultado = this.servicio.validar(id, estado, usuario);
    if (!resultado) { this.error.set('No fue posible validar. Revisa tu sesión y el estado del registro.'); return; }
    this.mensaje.set(`Avistamiento ${estado === 'Validado' ? 'validado' : 'rechazado'} correctamente.`);
  }
}
