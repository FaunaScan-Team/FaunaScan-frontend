/**
 * reportes-utils.js
 * FaunaScan Perú — Cálculos compartidos sobre avistamientos reales para
 * reportes.js, mis-reportes.js, mi-contribucion.js y tendencias.js.
 *
 * Antes de esto, "Reportes" mostraba siempre las mismas 4 tarjetas fijas
 * atribuidas a "Jose Aguilar" y una tabla de especies que nunca cambiaba
 * sin importar los filtros aplicados. Estas funciones calculan todo a
 * partir de los avistamientos reales guardados en FaunaAvistamientos.
 */
window.FaunaReportesUtils = (function () {
  function esCritica(estado) {
    return (estado || '').toUpperCase().indexOf('PELIGRO') !== -1;
  }

  function especiesUnicas(lista) {
    const set = new Set();
    lista.forEach(function (a) { if (a.especie && a.especie.nombre) set.add(a.especie.nombre); });
    return set;
  }

  function zonasUnicas(lista) {
    const set = new Set();
    lista.forEach(function (a) { if (a.area) set.add(a.area); });
    return set;
  }

  function contarCriticas(lista) {
    return lista.filter(function (a) { return a.especie && esCritica(a.especie.estado); }).length;
  }

  function porcentajeValidados(lista) {
    if (!lista.length) return 0;
    const validados = lista.filter(function (a) { return a.estadoValidacion === 'Validado'; }).length;
    return Math.round((validados / lista.length) * 100);
  }

  function agruparPorEspecie(lista) {
    const conteo = {};
    lista.forEach(function (a) {
      const nombre = (a.especie && a.especie.nombre) || 'Especie no especificada';
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });
    return conteo;
  }

  function especieTop(lista) {
    const conteo = agruparPorEspecie(lista);
    let top = null, max = 0;
    Object.keys(conteo).forEach(function (nombre) {
      if (conteo[nombre] > max) { max = conteo[nombre]; top = nombre; }
    });
    return top ? { nombre: top, cantidad: max } : null;
  }

  function filtrarPorRango(lista, desde, hasta) {
    if (!desde && !hasta) return lista;
    const desdeMs = desde ? new Date(desde).getTime() : -Infinity;
    const hastaMs = hasta ? new Date(hasta).getTime() + 24 * 60 * 60 * 1000 - 1 : Infinity;
    return lista.filter(function (a) {
      const t = new Date(a.fecha).getTime();
      return !isNaN(t) && t >= desdeMs && t <= hastaMs;
    });
  }

  function filtrarPorArea(lista, area) {
    if (!area) return lista;
    const q = area.toLowerCase().trim();
    return lista.filter(function (a) { return (a.area || '').toLowerCase().indexOf(q) !== -1; });
  }

  function mesLabel(fechaIso) {
    const f = new Date(fechaIso);
    if (isNaN(f.getTime())) return 'Sin fecha';
    return f.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  }

  function agruparPorMes(lista) {
    const grupos = {};
    lista.forEach(function (a) {
      const label = mesLabel(a.fecha);
      if (!grupos[label]) grupos[label] = [];
      grupos[label].push(a);
    });
    return grupos;
  }

  return {
    esCritica: esCritica,
    especiesUnicas: especiesUnicas,
    zonasUnicas: zonasUnicas,
    contarCriticas: contarCriticas,
    porcentajeValidados: porcentajeValidados,
    agruparPorEspecie: agruparPorEspecie,
    especieTop: especieTop,
    filtrarPorRango: filtrarPorRango,
    filtrarPorArea: filtrarPorArea,
    mesLabel: mesLabel,
    agruparPorMes: agruparPorMes
  };
})();
