import { Injectable } from '@angular/core';
import { CategoriaPreferencia, PreferenciasNotificaciones } from '../models/notificacion';

export const PREFERENCIAS_INICIALES: Readonly<PreferenciasNotificaciones> = {
  vulnerables: true,
  ausencia: true,
  bd: true,
  validacion: true,
  sync: true,
  mantenimiento: true,
};

@Injectable({ providedIn: 'root' })
export class PreferenciasNotificacionesService {
  private clave(email: string): string {
    return `faunascan-angular-notificaciones-preferencias:${encodeURIComponent(email.toLowerCase().trim())}`;
  }

  obtener(email: string): PreferenciasNotificaciones {
    const predeterminadas = { ...PREFERENCIAS_INICIALES };
    if (!email || typeof localStorage === 'undefined') return predeterminadas;
    try {
      const guardadas: unknown = JSON.parse(localStorage.getItem(this.clave(email)) ?? 'null');
      if (!guardadas || typeof guardadas !== 'object') return predeterminadas;
      for (const clave of Object.keys(predeterminadas) as CategoriaPreferencia[]) {
        const valor = (guardadas as Record<string, unknown>)[clave];
        if (typeof valor === 'boolean') predeterminadas[clave] = valor;
      }
    } catch { /* Preferencias predeterminadas si el navegador bloquea el almacenamiento. */ }
    return predeterminadas;
  }

  guardar(email: string, preferencias: PreferenciasNotificaciones): boolean {
    if (!email || typeof localStorage === 'undefined') return false;
    try {
      localStorage.setItem(this.clave(email), JSON.stringify(preferencias));
      return true;
    } catch { return false; }
  }
}
