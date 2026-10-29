export type EstadoConservacion = 'critico' | 'vulnerable' | 'casi' | 'menor';
export type FamiliaEspecie = 'mamifero' | 'ave' | 'reptil';

/** Modelo común propuesto para coordinar con el equipo. IDs estables del catálogo simulado. */
export interface Especie {
  readonly id: number;
  readonly nombre: string;
  readonly nombreCientifico: string;
  readonly estado: EstadoConservacion;
  readonly estadoLabel: string;
  readonly familia: FamiliaEspecie;
  readonly imagen: string;
  readonly emoji: string;
}
