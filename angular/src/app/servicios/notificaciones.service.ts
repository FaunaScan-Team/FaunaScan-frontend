import { Injectable } from '@angular/core';
import { Avistamiento } from '../models/avistamiento';
import { Notificacion, PreferenciasNotificaciones } from '../models/notificacion';

/** No crea eventos ficticios: solo registra cambios de estado en avistamientos propios. */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  generar(avistamientos: readonly Avistamiento[], email: string, preferencias: PreferenciasNotificaciones): Notificacion[] {
    if (!preferencias.validacion || !email) return [];
    return avistamientos
      .filter((av) => av.registradoPor?.email.toLowerCase() === email.toLowerCase() && av.estadoValidacion !== 'Pendiente')
      .map((av): Notificacion => ({
        id: `validacion:${av.id}:${av.estadoValidacion}`,
        categoria: 'alertas',
        titulo: av.estadoValidacion === 'Validado' ? 'Tu registro fue validado' : 'Tu registro fue rechazado',
        descripcion: `El avistamiento de ${av.especie.nombre} registrado en ${av.area} fue ${av.estadoValidacion.toLowerCase()}.`,
        fecha: av.validadoEn ?? av.creadoEn,
        avistamientoId: av.id,
      }))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  leerIdsLeidos(email: string): string[] {
    if (!email || typeof localStorage === 'undefined') return [];
    try {
      const valor: unknown = JSON.parse(localStorage.getItem(this.clave(email)) ?? '[]');
      return Array.isArray(valor) ? valor.filter((id): id is string => typeof id === 'string') : [];
    } catch { return []; }
  }

  guardarIdsLeidos(email: string, ids: readonly string[]): boolean {
    if (!email || typeof localStorage === 'undefined') return false;
    try {
      localStorage.setItem(this.clave(email), JSON.stringify(ids));
      return true;
    } catch { return false; }
  }

  private clave(email: string): string {
    return `faunascan-angular-notificaciones-leidas:${encodeURIComponent(email.toLowerCase().trim())}`;
  }
}
