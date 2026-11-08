/** Categorías del frontend original de FaunaScan. */
export type CategoriaNotificacion = 'criticas' | 'sistema' | 'alertas';
export type CategoriaPreferencia = 'vulnerables' | 'ausencia' | 'bd' | 'validacion' | 'sync' | 'mantenimiento';
export type PreferenciasNotificaciones = Record<CategoriaPreferencia, boolean>;
export interface Notificacion {
  id: string;
  categoria: CategoriaNotificacion;
  titulo: string;
  descripcion: string;
  fecha: string;
  avistamientoId: string;
}
