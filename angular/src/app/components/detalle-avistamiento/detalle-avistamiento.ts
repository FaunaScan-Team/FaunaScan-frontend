import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Avistamiento } from '../../models/avistamiento';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { FavoritosService } from '../../servicios/favoritos.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';

/** Fecha ISO en el formato que usa <input type="datetime-local">. */
function paraInput(iso: string): string {
  const fecha = new Date(iso);
  fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
  return fecha.toISOString().slice(0, 16);
}

/** Migración de public/detalle-avistamiento.html. Módulo de historial y reportes. */
@Component({
  selector: 'app-detalle-avistamiento',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <section class="fs-page" aria-labelledby="fs-detalle-title">
      @if (avistamiento(); as av) {
        <div class="fs-heading">
          <div>
            <p class="fs-eyebrow">Historial</p>
            <h1 id="fs-detalle-title">{{ av.especie.nombre }}</h1>
            <p class="fs-subtitle"><em>{{ av.especie.nombreCientifico }}</em> · registrado por {{ av.registradoPor.nombre || 'Usuario no identificado' }}</p>
          </div>
          <a class="fs-btn fs-btn--outline" routerLink="/historial">Volver al historial</a>
        </div>

        @if (mensaje()) { <p class="fs-exito" role="status">{{ mensaje() }}</p> }
        @if (error()) { <p class="fs-error" role="alert">{{ error() }}</p> }

        <div class="fs-columns fs-columns--iguales">
          <div class="fs-card">
            <h2 class="fs-card__title">Foto y ubicación</h2>
            <div class="fs-foto" aria-hidden="true">{{ av.especie.emoji || '🐾' }}</div>
            <p class="fs-muted" style="margin-top:10px; font-size:13px;">La carga de fotos la implementa el módulo de Añamauro.</p>
            <div class="fs-mapa">📍 {{ av.area || 'Zona no indicada' }}</div>
            <div class="fs-coords">
              <span>Lat: <strong>{{ av.latitud ?? 'No registrada' }}</strong></span>
              <span>Lng: <strong>{{ av.longitud ?? 'No registrada' }}</strong></span>
            </div>
          </div>

          <div>
            <div class="fs-card">
              <h2 class="fs-card__title">Datos del avistamiento</h2>
              <div class="fs-chips" style="margin-bottom:12px;">
                <span class="fs-badge" [class]="claseEstado(av)">{{ av.estadoValidacion }}</span>
                <button type="button" class="fs-fav" [attr.aria-pressed]="favoritos.esFavorito(av.id)"
                  [attr.aria-label]="favoritos.esFavorito(av.id) ? 'Quitar de favoritos' : 'Marcar como favorito'"
                  (click)="favoritos.alternar(av.id)">{{ favoritos.esFavorito(av.id) ? '★' : '☆' }}</button>
              </div>

              @if (!editando()) {
                <p><strong>Fecha:</strong> {{ av.fecha | date:'dd/MM/yyyy HH:mm' }}</p>
                <p><strong>Zona:</strong> {{ av.area || 'Sin zona' }}</p>
                <p style="margin-top:10px;">{{ av.descripcion || 'Sin descripción registrada.' }}</p>
                @if (av.validadoEn) {
                  <small>Resuelto por {{ av.validadoPor }} el {{ av.validadoEn | date:'dd/MM/yyyy HH:mm' }}</small>
                }
              } @else {
                <form [formGroup]="formulario" (ngSubmit)="guardar()" novalidate class="fs-stack">
                  <div class="fs-field">
                    <label for="ed-fecha">Fecha y hora</label>
                    <input id="ed-fecha" class="fs-input" type="datetime-local" formControlName="fecha">
                  </div>
                  <div class="fs-field">
                    <label for="ed-area">Zona</label>
                    <input id="ed-area" class="fs-input" type="text" formControlName="area">
                  </div>
                  <div class="fs-field">
                    <label for="ed-desc">Descripción</label>
                    <textarea id="ed-desc" class="fs-input" rows="3" maxlength="500" formControlName="descripcion"></textarea>
                  </div>
                  <div class="fs-actions">
                    <button type="submit" class="fs-btn fs-btn--primary" [disabled]="formulario.invalid">Guardar cambios</button>
                    <button type="button" class="fs-btn fs-btn--outline" (click)="editando.set(false)">Cancelar</button>
                  </div>
                </form>
              }
            </div>

            <div class="fs-card">
              <h2 class="fs-card__title">Observaciones detalladas</h2>
              @if (av.observaciones; as obs) {
                <div class="fs-chips">
                  @if (obs.clima) { <span class="fs-chip">{{ obs.clima }}</span> }
                  @for (etiqueta of obs.etiquetas; track etiqueta) { <span class="fs-chip">{{ etiqueta }}</span> }
                </div>
                <div class="fs-metrics">
                  <div>Temperatura <strong>{{ obs.temperatura ?? '—' }} °C</strong></div>
                  <div>Humedad <strong>{{ obs.humedad ?? '—' }} %</strong></div>
                  <div>Individuos <strong>{{ obs.individuos ?? '—' }}</strong></div>
                </div>
                @if (obs.notas) { <p style="margin-top:12px;">{{ obs.notas }}</p> }
              } @else {
                <p class="fs-muted">Este avistamiento se guardó sin observaciones detalladas.</p>
              }
            </div>

            @if (esAutor()) {
              <div class="fs-card">
                <h2 class="fs-card__title">Acciones</h2>
                @if (av.estadoValidacion === 'Pendiente') {
                  <button type="button" class="fs-btn fs-btn--outline fs-btn--full" (click)="abrirEdicion(av)">Editar</button>
                } @else {
                  <p class="fs-muted">El registro ya fue resuelto por un investigador, así que no se puede editar.</p>
                }
                @if (!confirmando()) {
                  <button type="button" class="fs-btn fs-btn--danger fs-btn--full" style="margin-top:10px;"
                    (click)="confirmando.set(true)">Eliminar</button>
                } @else {
                  <div class="fs-aviso" style="margin-top:10px;">
                    ¿Eliminar este avistamiento? No se podrá recuperar la información.
                    <div class="fs-actions">
                      <button type="button" class="fs-btn fs-btn--danger" (click)="eliminar(av.id)">Sí, eliminar</button>
                      <button type="button" class="fs-btn fs-btn--outline" (click)="confirmando.set(false)">Cancelar</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      } @else {
        <h1 id="fs-detalle-title">Avistamiento no encontrado</h1>
        <p class="fs-empty">No existe un registro con ese identificador. <a routerLink="/historial">Volver al historial</a>.</p>
      }
    </section>
  `,
  styleUrl: '../compartido/paneles.css',
})
export class DetalleAvistamiento {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicio = inject(AvistamientosService);
  private readonly sesion = inject(SesionConsultaService);
  protected readonly favoritos = inject(FavoritosService);

  private readonly id = this.ruta.snapshot.paramMap.get('id') ?? '';
  protected readonly editando = signal(false);
  protected readonly confirmando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  protected readonly avistamiento = computed(() =>
    this.servicio.lista().find((av) => av.id === this.id),
  );

  protected readonly esAutor = computed(() => {
    const email = this.sesion.usuarioActual()?.email.toLowerCase();
    const autor = this.avistamiento()?.registradoPor.email.toLowerCase();
    return !!email && !!autor && email === autor;
  });

  protected readonly formulario = this.fb.group({
    fecha: ['', Validators.required],
    area: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    descripcion: ['', Validators.maxLength(500)],
  });

  protected claseEstado(av: Avistamiento): string {
    if (av.estadoValidacion === 'Validado') return 'fs-badge--validado';
    if (av.estadoValidacion === 'Rechazado') return 'fs-badge--rechazado';
    return 'fs-badge--pendiente';
  }

  protected abrirEdicion(av: Avistamiento): void {
    this.formulario.setValue({
      fecha: paraInput(av.fecha),
      area: av.area,
      descripcion: av.descripcion,
    });
    this.mensaje.set('');
    this.error.set('');
    this.editando.set(true);
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    const guardado = this.servicio.actualizar(this.id, {
      fecha: new Date(valores.fecha).toISOString(),
      area: valores.area,
      descripcion: valores.descripcion,
    });
    if (!guardado) {
      this.error.set('No se pudo guardar. Solo el autor puede editar un registro pendiente.');
      return;
    }
    this.editando.set(false);
    this.error.set('');
    this.mensaje.set('Cambios guardados.');
  }

  protected eliminar(id: string): void {
    if (!this.servicio.eliminar(id)) {
      this.error.set('No se pudo eliminar. Solo el autor puede borrar su registro.');
      this.confirmando.set(false);
      return;
    }
    this.favoritos.quitar(id);
    this.router.navigate(['/historial']);
  }
}
