import { Component, inject } from '@angular/core';
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
  templateUrl: './configuracion-notificaciones.html',
  styleUrl: './configuracion-notificaciones.css',
})
export class ConfiguracionNotificaciones {
  private readonly preferenciasService = inject(PreferenciasNotificacionesService);
  private readonly sesionService = inject(SesionConsultaService);

  email = this.sesionService.usuarioActual()?.email ?? '';
  borrador: PreferenciasNotificaciones = this.preferenciasService.obtener(this.email);
  mensaje = '';
  guardado = false;

  readonly opciones: OpcionPreferencia[] = [
    { clave: 'vulnerables', icono: '🔔', titulo: 'Alertas de especies vulnerables', descripcion: 'Nuevos avistamientos críticos cuando exista información confiable de conservación.' },
    { clave: 'ausencia', icono: '🧬', titulo: 'Ausencia prolongada de especie', descripcion: 'Alertas cuando existan umbrales científicos configurados.' },
    { clave: 'bd', icono: '📚', titulo: 'Actualizaciones de base de datos', descripcion: 'Cambios verificados del catálogo de especies.' },
    { clave: 'validacion', icono: '✔️', titulo: 'Validación de mis registros', descripcion: 'Avisos cuando un investigador valide o rechace un avistamiento tuyo.' },
    { clave: 'sync', icono: '📡', titulo: 'Sincronización offline', descripcion: 'Avisos de sincronización cuando el módulo esté disponible.' },
    { clave: 'mantenimiento', icono: '🛠️', titulo: 'Mantenimiento del sistema', descripcion: 'Avisos cuando exista un mantenimiento programado.' },
  ];

  get categoriasActivas(): number {
    return Object.values(this.borrador).filter(Boolean).length;
  }

  cambiar(clave: CategoriaPreferencia, evento: Event): void {
    this.borrador = { ...this.borrador, [clave]: (evento.target as HTMLInputElement).checked };
    this.mensaje = '';
  }

  guardar(evento: Event): void {
    evento.preventDefault();
    this.guardado = this.preferenciasService.guardar(this.email, this.borrador);
    this.mensaje = this.guardado
      ? 'Preferencias guardadas para tu cuenta.'
      : 'No se pudieron guardar las preferencias en este navegador.';
  }
}
