import {ProgresoUsuario} from '../../models/progreso-usuario';

// Insignias de los paneles y de mi contribución, calculadas con los totales que devuelve el backend
export interface Logro {
  icono: string;
  titulo: string;
  detalle: string;
  alcanzado: boolean;
}

export function calcularLogros(progreso: ProgresoUsuario, validados: number): Logro[] {
  const total = progreso.totalAvistamientos;
  return [
    {icono: '🥾', titulo: 'Primer avistamiento', detalle: 'Registraste tu primer animal', alcanzado: total >= 1},
    {icono: '🔭', titulo: 'Observador constante', detalle: '5 avistamientos registrados', alcanzado: total >= 5},
    {icono: '🐾', titulo: 'Explorador de especies', detalle: '3 especies distintas', alcanzado: progreso.especiesRegistradas >= 3},
    {icono: '🗺️', titulo: 'Recorre el país', detalle: '3 zonas visitadas', alcanzado: progreso.zonasVisitadas >= 3},
    {icono: '✅', titulo: 'Dato confiable', detalle: '3 registros validados por un investigador', alcanzado: validados >= 3},
    {icono: '🏅', titulo: 'Centinela', detalle: '10 avistamientos registrados', alcanzado: total >= 10},
  ];
}

// Próxima meta de avistamientos, para la barra de progreso
export function siguienteMeta(total: number): number {
  const metas = [1, 5, 10, 25, 50, 100];
  return metas.find(meta => total < meta) ?? total;
}
