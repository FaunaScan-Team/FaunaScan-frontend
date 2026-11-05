import { EspecieResumen } from '../../models/avistamiento';

/**
 * Especies simuladas para elegir en el formulario.
 * Los `id` coinciden con los datos del catálogo (rama feature/angular-catalogo).
 * Al integrar, se puede reemplazar por la lista ESPECIES del catálogo.
 */
export const ESPECIES_REGISTRO: readonly EspecieResumen[] = [
  { id: 1, nombre: 'Cóndor andino', nombreCientifico: 'Vultur gryphus', emoji: '🦅' },
  { id: 2, nombre: 'Oso de anteojos', nombreCientifico: 'Tremarctos ornatus', emoji: '🐻' },
  { id: 3, nombre: 'Jaguar', nombreCientifico: 'Panthera onca', emoji: '🐆' },
  { id: 4, nombre: 'Guacamayo rojo', nombreCientifico: 'Ara macao', emoji: '🦜' },
  { id: 5, nombre: 'Tapir amazónico', nombreCientifico: 'Tapirus terrestris', emoji: '🦌' },
  { id: 6, nombre: 'Delfín rosado', nombreCientifico: 'Inia geoffrensis', emoji: '🐬' },
  { id: 7, nombre: 'Anaconda verde', nombreCientifico: 'Eunectes murinus', emoji: '🐍' },
  { id: 11, nombre: 'Puma', nombreCientifico: 'Puma concolor', emoji: '🐈' },
];
