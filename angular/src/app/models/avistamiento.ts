/**
 * Modelo común de avistamiento.
 * Lo usan `registrar` (guarda) e `historial` / `detalle-avistamiento` (muestran).
 * Si cambias un campo, avisa en el grupo para no romper la otra parte.
 */

export type Clima =
  | 'Soleado'
  | 'Parcial nublado'
  | 'Lluvioso'
  | 'Nublado'
  | 'Ventoso'
  | 'Tormenta'
  | 'Frío intenso'
  | 'Caluroso';

export type EstadoValidacion = 'Pendiente' | 'Validado' | 'Rechazado';

/** Datos que se llenan en la pantalla /observaciones. */
export interface ObservacionesDetalladas {
  clima: Clima | null;
  temperatura: number | null;
  humedad: number | null;
  individuos: number | null;
  notas: string;
  etiquetas: string[];
}

/** Resumen de la especie guardado junto al avistamiento. */
export interface EspecieResumen {
  /** Mismo `id` numérico que el modelo `Especie` del catálogo. */
  id: number;
  nombre: string;
  nombreCientifico: string;
  emoji: string;
}

export interface Avistamiento {
  id: string;
  especie: EspecieResumen;
  /** Fecha y hora del avistamiento en formato ISO. */
  fecha: string;
  area: string;
  latitud: number | null;
  longitud: number | null;
  descripcion: string;
  observaciones: ObservacionesDetalladas | null;
  estadoValidacion: EstadoValidacion;
  /** Fecha y hora en que se registró en la app, en formato ISO. */
  creadoEn: string;
}

/** Lo que envía el formulario; el servicio completa id, estado y creadoEn. */
export type NuevoAvistamiento = Omit<Avistamiento, 'id' | 'estadoValidacion' | 'creadoEn'>;
