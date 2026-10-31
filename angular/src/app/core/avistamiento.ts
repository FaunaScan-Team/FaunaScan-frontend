/**
 * Modelo de un avistamiento guardado.
 * Refleja la forma que escribe registrar.js en localStorage ("faunaAvistamientos"),
 * para que la versión Angular lea los mismos datos que la versión HTML.
 */

export type EstadoValidacion = 'Validado' | 'Pendiente' | 'No Validado' | 'Rechazado';

export interface Especie {
  nombre?: string;
  cientifico?: string;
  emoji?: string;
  estado?: string;
}

export interface Observaciones {
  descripcion?: string;
  clima?: string;
  temp?: number | string;
  humedad?: number | string;
  individuos?: number | string;
}

export interface Foto {
  src?: string;
  nombre?: string;
}

export interface RegistradoPor {
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: string;
  credencialVerificada?: boolean;
}

export interface Avistamiento {
  id: string;
  especie?: Especie | null;
  foto?: Foto | null;
  fecha?: string;
  area?: string;
  lat?: number | null;
  lng?: number | null;
  observaciones?: Observaciones | null;
  estadoValidacion?: EstadoValidacion;
  favorito?: boolean;
  registradoPor?: RegistradoPor | null;
  creadoEn?: string;
}

export interface Usuario {
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: string;
  credencialVerificada?: boolean;
}
