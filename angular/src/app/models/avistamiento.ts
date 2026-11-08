/**
 * PROPUESTA de actualización del contrato compartido de avistamientos.
 * Coordinar revisión y aceptación con Sebastián Añamauro y Sebastián Suárez.
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

export interface ObservacionesDetalladas {
  clima: Clima | null;
  temperatura: number | null;
  humedad: number | null;
  individuos: number | null;
  notas: string;
  etiquetas: string[];
}

export interface EspecieResumen {
  /** Mantener ID numérico, compatible con el catálogo de Estefany. */
  id: number;
  nombre: string;
  nombreCientifico: string;
  emoji: string;
}

export interface UsuarioAvistamiento {
  email: string;
  nombre: string;
}

export interface Avistamiento {
  /** ID de registro: string, no confundir con el ID numérico de la especie. */
  id: string;
  especie: EspecieResumen;
  /** ISO de la fecha del avistamiento. */
  fecha: string;
  area: string;
  latitud: number | null;
  longitud: number | null;
  descripcion: string;
  observaciones: ObservacionesDetalladas | null;
  registradoPor: UsuarioAvistamiento;
  estadoValidacion: EstadoValidacion;
  /** Email del investigador validador. */
  validadoPor: string | null;
  /** ISO de la fecha y hora de validación. */
  validadoEn: string | null;
  /** ISO del momento en el que se guardó el registro. */
  creadoEn: string;
}

/** El servicio completa el usuario registrador, ID, estado y fechas. */
export type NuevoAvistamiento = Omit<
  Avistamiento,
  'id' | 'registradoPor' | 'estadoValidacion' | 'validadoPor' | 'validadoEn' | 'creadoEn'
>;
