/**
 * avistamientos-store.js
 * FaunaScan Perú — Acceso compartido a los avistamientos guardados en
 * localStorage (clave "faunaAvistamientos").
 *
 * Antes de esto, "Guardar avistamiento" en registrar.js mostraba un banner
 * de éxito pero no escribía el registro en ningún lado, y
 * detalle-avistamiento.js editaba/eliminaba solo el DOM en memoria — nada
 * de eso sobrevivía a un recargo de página. Este módulo centraliza el
 * CRUD real para que registrar/historial/detalle lean y escriban la misma
 * fuente de datos.
 */
window.FaunaAvistamientos = (function () {
  var KEY = 'faunaAvistamientos';

  function getAll() {
    try {
      var lista = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function saveAll(lista) {
    localStorage.setItem(KEY, JSON.stringify(lista));
  }

  function add(avistamiento) {
    var lista = getAll();
    lista.unshift(avistamiento);
    saveAll(lista);
    return avistamiento;
  }

  function getById(id) {
    var lista = getAll();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) return lista[i];
    }
    return null;
  }

  function update(id, cambios) {
    var lista = getAll();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) {
        lista[i] = Object.assign({}, lista[i], cambios);
        saveAll(lista);
        return lista[i];
      }
    }
    return null;
  }

  function remove(id) {
    var lista = getAll().filter(function (a) { return a.id !== id; });
    saveAll(lista);
  }

  function generarId() {
    return 'av-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  return {
    getAll: getAll,
    add: add,
    getById: getById,
    update: update,
    remove: remove,
    generarId: generarId
  };
})();
