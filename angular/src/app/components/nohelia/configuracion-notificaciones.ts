import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoriaPreferencia, PreferenciasNotificaciones } from '../../models/notificacion';
import { PreferenciasNotificacionesService } from '../../servicios/preferencias-notificaciones.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';

interface OpcionPreferencia {
  clave: CategoriaPreferencia;
  icono: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-configuracion-notificaciones',
  imports: [RouterLink],
  template: `
    <section class="nohe-page" aria-labelledby="conf-title">
      <div class="nohe-heading">
        <div><p class="nohe-eyebrow">Preferencias personales</p><h1 id="conf-title">Configuración de notificaciones</h1>
          <p class="nohe-subtitle">Elige qué tipos de avisos deseas recibir.</p></div>
        <a class="nohe-btn nohe-btn--outline" routerLink="/notificaciones">← Volver</a>
      </div>
      <p class="nohe-demo">Estas preferencias se guardan en este navegador para la cuenta: <strong>{{ email }}</strong>.</p>
      <div class="nohe-columns">
        <form class="nohe-card nohe-stack" (submit)="guardar($event)">
          <h2>Categorías de notificaciones</h2>
          @for (opcion of opciones; track opcion.clave) {
            <label class="nohe-setting">
              <span class="nohe-avatar" aria-hidden="true">{{ opcion.icono }}</span>
              <span class="nohe-grow"><strong>{{ opcion.titulo }}</strong><small>{{ opcion.descripcion }}</small></span>
              <input type="checkbox" [checked]="borrador()[opcion.clave]"
                (change)="cambiar(opcion.clave, $event)" [attr.aria-label]="opcion.titulo" />
            </label>
          }
          <button type="submit" class="nohe-btn nohe-btn--primary">Guardar preferencias</button>
          @if (mensaje()) { <p role="status" [class.nohe-error]="!guardado()">{{ mensaje() }}</p> }
        </form>
        <aside class="nohe-card nohe-aside">
          <h2>Vista previa</h2>
          <p>Actualmente tienes <strong>{{ categoriasActivas() }}</strong> de 6 categorías habilitadas.</p>
          <p>Solo se mostrarán avisos cuando exista un evento real correspondiente a la categoría.</p>
          <p class="nohe-note">Todavía no hay backend de notificaciones ni sincronización offline: estos controles preparan las preferencias del prototipo.</p>
        </aside>
      </div>
    </section>
  `,
  styleUrl: './nohelia.css',
})
export class ConfiguracionNotificaciones {
  private readonly servicio = inject(PreferenciasNotificacionesService);
  protected readonly email = inject(SesionConsultaService).usuarioActual()?.email ?? '';
  protected readonly borrador = signal<PreferenciasNotificaciones>(this.servicio.obtener(this.email));
  protected readonly mensaje = signal('');
  protected readonly guardado = signal(false);
  protected readonly categoriasActivas = computed(() => Object.values(this.borrador()).filter(Boolean).length);
  protected readonly opciones: readonly OpcionPreferencia[] = [
    { clave: 'vulnerables', icono: '🔔', titulo: 'Alertas de especies vulnerables', descripcion: 'Nuevos avistamientos críticos cuando exista información confiable de conservación.' },
    { clave: 'ausencia', icono: '🧬', titulo: 'Ausencia prolongada de especie', descripcion: 'Alertas cuando existan umbrales científicos configurados.' },
    { clave: 'bd', icono: '📚', titulo: 'Actualizaciones de base de datos', descripcion: 'Cambios verificados del catálogo de especies.' },
    { clave: 'validacion', icono: '✔️', titulo: 'Validación de mis registros', descripcion: 'Avisos cuando un investigador valide o rechace un avistamiento tuyo.' },
    { clave: 'sync', icono: '📡', titulo: 'Sincronización offline', descripcion: 'Avisos de sincronización cuando el módulo esté disponible.' },
    { clave: 'mantenimiento', icono: '🛠️', titulo: 'Mantenimiento del sistema', descripcion: 'Avisos cuando exista un mantenimiento programado.' },
  ];

  protected cambiar(clave: CategoriaPreferencia, evento: Event): void {
    const activo = (evento.target as HTMLInputElement).checked;
    this.borrador.update((actual) => ({ ...actual, [clave]: activo }));
    this.mensaje.set('');
  }

  protected guardar(evento: Event): void {
    evento.preventDefault();
    const correcto = this.servicio.guardar(this.email, this.borrador());
    this.guardado.set(correcto);
    this.mensaje.set(correcto ? 'Preferencias guardadas para tu cuenta.' : 'No se pudieron guardar las preferencias en este navegador.');
  }
}
