import { Avistamiento } from '../../models/avistamiento';

/**
 * Cálculos compartidos por historial, paneles, resumen mensual
 * y mi contribución.
 * Solo leen la lista del servicio: no modifican datos.
 */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export interface ResumenMes {
  /** Formato 'AAAA-MM'. */
  clave: string;
  etiqueta: string;
  avistamientos: Avistamiento[];
}

export interface Logro {
  icono: string;
  titulo: string;
  detalle: string;
  alcanzado: boolean;
}

export interface ConteoZona {
  zona: string;
  total: number;
}

export function normalizarArea(area: string): string {
  return area.trim().toLowerCase();
}

export function especiesDistintas(lista: readonly Avistamiento[]): number {
  return new Set(lista.map((av) => av.especie.id)).size;
}

export function zonasDistintas(lista: readonly Avistamiento[]): number {
  return new Set(lista.map((av) => normalizarArea(av.area)).filter(Boolean)).size;
}

export function claveMes(iso: string): string {
  return iso.slice(0, 7);
}

export function etiquetaMes(clave: string): string {
  const [anio, mes] = clave.split('-');
  const nombre = MESES[Number(mes) - 1] ?? '';
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${anio}`;
}

/** Agrupa por mes del avistamiento, del más reciente al más antiguo. */
export function agruparPorMes(lista: readonly Avistamiento[]): ResumenMes[] {
  const grupos = new Map<string, Avistamiento[]>();
  for (const av of lista) {
    const clave = claveMes(av.fecha);
    const grupo = grupos.get(clave);
    if (grupo) grupo.push(av);
    else grupos.set(clave, [av]);
  }
  return [...grupos.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([clave, avistamientos]) => ({ clave, etiqueta: etiquetaMes(clave), avistamientos }));
}

export function conteoPorZona(lista: readonly Avistamiento[]): ConteoZona[] {
  const conteo = new Map<string, { zona: string; total: number }>();
  for (const av of lista) {
    const clave = normalizarArea(av.area);
    if (!clave) continue;
    const actual = conteo.get(clave);
    if (actual) actual.total += 1;
    else conteo.set(clave, { zona: av.area.trim(), total: 1 });
  }
  return [...conteo.values()].sort((a, b) => b.total - a.total);
}

/** Día local en formato AAAA-MM-DD; evita el desfase de toISOString(). */
function claveDiaLocal(fecha: Date): string {
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fecha.getDate()}`.padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Días seguidos con al menos un registro, contados hasta hoy o ayer. */
export function rachaDias(lista: readonly Avistamiento[]): number {
  const dias = new Set(lista.map((av) => claveDiaLocal(new Date(av.creadoEn))));
  if (dias.size === 0) return 0;

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!dias.has(claveDiaLocal(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dias.has(claveDiaLocal(cursor))) return 0;
  }

  let racha = 0;
  while (dias.has(claveDiaLocal(cursor))) {
    racha += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return racha;
}

export function calcularLogros(lista: readonly Avistamiento[]): Logro[] {
  const total = lista.length;
  const especies = especiesDistintas(lista);
  const zonas = zonasDistintas(lista);
  const validados = lista.filter((av) => av.estadoValidacion === 'Validado').length;

  return [
    { icono: '🥾', titulo: 'Primer avistamiento', detalle: 'Registraste tu primer animal', alcanzado: total >= 1 },
    { icono: '🔭', titulo: 'Observador constante', detalle: '5 avistamientos registrados', alcanzado: total >= 5 },
    { icono: '🐾', titulo: 'Explorador de especies', detalle: '3 especies distintas', alcanzado: especies >= 3 },
    { icono: '🗺️', titulo: 'Recorre el país', detalle: '3 zonas visitadas', alcanzado: zonas >= 3 },
    { icono: '✅', titulo: 'Dato confiable', detalle: '3 registros validados por un investigador', alcanzado: validados >= 3 },
    { icono: '🏅', titulo: 'Centinela', detalle: '10 avistamientos registrados', alcanzado: total >= 10 },
  ];
}

/** Próxima meta de avistamientos, para la barra de progreso. */
export function siguienteMeta(total: number): number {
  const metas = [1, 5, 10, 25, 50, 100];
  return metas.find((meta) => total < meta) ?? total;
}

/**
 * Avisos del mes elegido. Reglas acordadas en el prototipo,
 * sin usar el estado de conservación (todavía no está en EspecieResumen).
 */
export function alertasDelMes(mes: ResumenMes, anterior?: ResumenMes): string[] {
  const avisos: string[] = [];
  const total = mes.avistamientos.length;
  const previo = anterior?.avistamientos.length ?? 0;

  if (previo > 0) {
    const variacion = Math.round(((total - previo) / previo) * 100);
    if (variacion <= -30) {
      avisos.push(`Los registros bajaron ${Math.abs(variacion)}% respecto a ${anterior!.etiqueta.toLowerCase()}.`);
    }
    if (variacion >= 50) {
      avisos.push(`Los registros subieron ${variacion}% respecto a ${anterior!.etiqueta.toLowerCase()}.`);
    }
  }

  const pendientes = mes.avistamientos.filter((av) => av.estadoValidacion === 'Pendiente').length;
  if (pendientes > 0) {
    avisos.push(`${pendientes} registro(s) siguen pendientes de validación.`);
  }

  const conteoEspecies = new Map<number, { nombre: string; total: number }>();
  for (const av of mes.avistamientos) {
    const actual = conteoEspecies.get(av.especie.id);
    if (actual) actual.total += 1;
    else conteoEspecies.set(av.especie.id, { nombre: av.especie.nombre, total: 1 });
  }
  const unicas = [...conteoEspecies.values()].filter((item) => item.total === 1).map((item) => item.nombre);
  if (unicas.length > 0) {
    avisos.push(`Especies con un único avistamiento: ${unicas.join(', ')}.`);
  }

  return avisos;
}
