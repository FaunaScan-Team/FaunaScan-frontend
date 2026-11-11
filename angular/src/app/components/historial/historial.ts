import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Avistamiento } from '../../models/avistamiento';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { FavoritosService } from '../../servicios/favoritos.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';
import { normalizarArea } from '../compartido/estadisticas-avistamientos';

type Periodo = '' | 'mes' | 'trimestre' | 'anio' | 'personalizado';

/** Migración de public/historial.html. Módulo de historial y reportes. */
@Component({
  selector: 'app-historial',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <section class="fs-page" aria-labelledby="fs-historial-title">
      <div class="fs-heading">
        <div>
          <p class="fs-eyebrow">Mis registros</p>
          <h1 id="fs-historial-title">Historial de avistamientos</h1>
          <p class="fs-subtitle">Filtra tus avistamientos por especie, período, estado o zona, y abre el detalle de cada uno.</p>
        </div>
        <a class="fs-btn fs-btn--primary" routerLink="/registrar">Nuevo avistamiento</a>
      </div>

      <p class="fs-demo">Datos locales de demostración. Al conectar el backend, la lista vendrá del servidor.</p>

      <div class="fs-columns">
        <aside class="fs-card" [formGroup]="filtros">
          <h2 class="fs-card__title">Filtros</h2>
          <div class="fs-stack">
            <div class="fs-field">
              <label for="f-especie">Animal</label>
              <input id="f-especie" class="fs-input" type="text" formControlName="especie" placeholder="Nombre de especie...">
            </div>
            <div class="fs-field">
              <label for="f-periodo">Período</label>
              <select id="f-periodo" class="fs-input" formControlName="periodo">
                <option value="">Todos</option>
                <option value="mes">Este mes</option>
                <option value="trimestre">Último trimestre</option>
                <option value="anio">Este año</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>
            @if (filtros.controls.periodo.value === 'personalizado') {
              <div class="fs-row">
                <div class="fs-field">
                  <label for="f-desde">Desde</label>
                  <input id="f-desde" class="fs-input" type="date" formControlName="desde">
                </div>
                <div class="fs-field">
                  <label for="f-hasta">Hasta</label>
                  <input id="f-hasta" class="fs-input" type="date" formControlName="hasta">
                </div>
              </div>
            }
            <div class="fs-field">
              <label for="f-estado">Estado</label>
              <select id="f-estado" class="fs-input" formControlName="estado">
                <option value="">Todos</option>
                <option value="Validado">Validado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
            <div class="fs-field">
              <label for="f-zona">Zona</label>
              <input id="f-zona" class="fs-input" type="text" formControlName="zona" placeholder="Nombre de zona...">
            </div>
            <label class="fs-muted" style="display:flex; gap:9px; align-items:center; font-size:14px;">
              <input type="checkbox" formControlName="comunidad"> Ver también registros de otros usuarios
            </label>
            <button type="button" class="fs-btn fs-btn--outline fs-btn--full" (click)="limpiar()">Limpiar filtros</button>
          </div>
        </aside>

        <div>
          <div class="fs-card">
            <h2 class="fs-card__title">
              Registros
              <span class="fs-muted" style="font-weight:400;">({{ resultados().length }} de {{ base().length }})</span>
            </h2>
            @if (base().length === 0) {
              <p class="fs-empty">Aún no tienes avistamientos registrados. <a routerLink="/registrar">Registra el primero</a>.</p>
            } @else if (resultados().length === 0) {
              <p class="fs-empty">Ningún avistamiento coincide con los filtros aplicados.</p>
            } @else {
              <div class="fs-tabla__scroll">
                <table class="fs-tabla">
                  <caption class="sr-only">Lista de avistamientos filtrados</caption>
                  <thead>
                    <tr>
                      <th scope="col"><span class="sr-only">Favorito</span></th>
                      <th scope="col">Especie</th>
                      <th scope="col">Zona</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Estado</th>
                      <th scope="col"><span class="sr-only">Detalle</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (av of resultados(); track av.id) {
                      <tr>
                        <td>
                          <button type="button" class="fs-fav"
                            [attr.aria-pressed]="favoritos.esFavorito(av.id)"
                            [attr.aria-label]="favoritos.esFavorito(av.id) ? 'Quitar de favoritos' : 'Marcar como favorito'"
                            (click)="favoritos.alternar(av.id)">{{ favoritos.esFavorito(av.id) ? '★' : '☆' }}</button>
                        </td>
                        <td>
                          <strong>{{ av.especie.emoji }} {{ av.especie.nombre }}</strong>
                          <small><em>{{ av.especie.nombreCientifico }}</em></small>
                        </td>
                        <td>{{ av.area || 'Sin zona' }}</td>
                        <td>{{ av.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                        <td><span class="fs-badge" [class]="claseEstado(av)">{{ av.estadoValidacion }}</span></td>
                        <td><a class="fs-link" [routerLink]="['/avistamientos', av.id]">Ver detalle</a></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <div class="fs-card">
            <h2 class="fs-card__title">Favoritos</h2>
            @if (marcados().length === 0) {
              <p class="fs-muted">Aún no marcaste avistamientos como favoritos. Usa la estrella de la tabla.</p>
            } @else {
              @for (av of marcados(); track av.id) {
                <div class="fs-item">
                  <span class="fs-avatar" aria-hidden="true">{{ av.especie.emoji || '🐾' }}</span>
                  <div class="fs-grow">
                    <strong>{{ av.especie.nombre }}</strong>
                    <small>📍 {{ av.area || 'Sin zona' }} · {{ av.fecha | date:'dd/MM/yyyy' }}</small>
                    <a class="fs-link" [routerLink]="['/avistamientos', av.id]">Ver detalle</a>
                  </div>
                  <button type="button" class="fs-btn fs-btn--outline" (click)="favoritos.quitar(av.id)">Quitar</button>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: '../compartido/paneles.css',
})
export class Historial {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly avistamientos = inject(AvistamientosService);
  private readonly sesion = inject(SesionConsultaService);
  protected readonly favoritos = inject(FavoritosService);

  protected readonly filtros = this.fb.group({
    especie: '',
    periodo: '' as Periodo,
    desde: '',
    hasta: '',
    estado: '',
    zona: '',
    comunidad: false,
  });

  private readonly valores = toSignal(this.filtros.valueChanges, {
    initialValue: this.filtros.getRawValue(),
  });

  /** Registros del usuario de la sesión, o de toda la comunidad si lo pide. */
  protected readonly base = computed(() => {
    const email = this.sesion.usuarioActual()?.email.toLowerCase();
    const lista = this.avistamientos.lista();
    if (this.valores().comunidad || !email) return lista;
    return lista.filter((av) => av.registradoPor.email.toLowerCase() === email);
  });

  protected readonly resultados = computed(() => {
    const f = this.valores();
    const especie = (f.especie ?? '').trim().toLowerCase();
    const zona = (f.zona ?? '').trim().toLowerCase();
    const [desde, hasta] = this.rangoFechas(f.periodo ?? '', f.desde ?? '', f.hasta ?? '');

    return this.base().filter((av) => {
      if (especie && !`${av.especie.nombre} ${av.especie.nombreCientifico}`.toLowerCase().includes(especie)) return false;
      if (zona && !normalizarArea(av.area).includes(zona)) return false;
      if (f.estado && av.estadoValidacion !== f.estado) return false;
      const fecha = new Date(av.fecha).getTime();
      if (desde !== null && fecha < desde) return false;
      if (hasta !== null && fecha > hasta) return false;
      return true;
    });
  });

  protected readonly marcados = computed(() => {
    const ids = this.favoritos.lista();
    return this.avistamientos.lista().filter((av) => ids.includes(av.id));
  });

  protected claseEstado(av: Avistamiento): string {
    if (av.estadoValidacion === 'Validado') return 'fs-badge--validado';
    if (av.estadoValidacion === 'Rechazado') return 'fs-badge--rechazado';
    return 'fs-badge--pendiente';
  }

  protected limpiar(): void {
    this.filtros.reset();
  }

  /** Devuelve los límites del período en milisegundos; null significa sin límite. */
  private rangoFechas(periodo: string, desde: string, hasta: string): [number | null, number | null] {
    const hoy = new Date();
    switch (periodo) {
      case 'mes': {
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        return [inicio.getTime(), null];
      }
      case 'trimestre': {
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
        return [inicio.getTime(), null];
      }
      case 'anio': {
        const inicio = new Date(hoy.getFullYear(), 0, 1);
        return [inicio.getTime(), null];
      }
      case 'personalizado': {
        const inicio = desde ? new Date(`${desde}T00:00:00`).getTime() : null;
        const fin = hasta ? new Date(`${hasta}T23:59:59`).getTime() : null;
        return [inicio, fin];
      }
      default:
        return [null, null];
    }
  }
}
