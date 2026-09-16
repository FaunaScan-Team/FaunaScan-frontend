/**
 * reportes-store.js
 * FaunaScan Perú — CRUD de reportes generados sobre localStorage
 * ("faunaReportes"). reportes.js guarda aquí lo que el investigador genera
 * en "Generar reporte"; mis-reportes.js lista los reportes del usuario
 * autenticado desde esta misma fuente (US51: antes eran 4 reportes fijos
 * atribuidos siempre a "Jose Aguilar", sin relación con quién generó qué).
 */
window.FaunaReportes = (function () {
  const KEY = 'faunaReportes';

  function getAll() {
    try {
      const lista = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function saveAll(lista) {
    localStorage.setItem(KEY, JSON.stringify(lista));
  }

  function add(reporte) {
    const lista = getAll();
    lista.unshift(reporte);
    saveAll(lista);
    return reporte;
  }

  function generarId() {
    return 'rep-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  return { getAll: getAll, add: add, generarId: generarId };
})();
