/**
 * compartidos-store.js
 * FaunaScan Perú — Avistamientos compartidos con colegas (US56).
 *
 * US56 ("compartir un avistamiento específico con colegas investigadores
 * para coordinar hallazgos sin depender de canales externos") no estaba
 * implementada: la app solo permitía compartir reportes (US46), no un
 * avistamiento puntual. Este módulo guarda, en la clave
 * "faunaCompartidos" de localStorage, a qué colegas se envió cada
 * avistamiento, con qué mensaje y en qué fecha.
 *
 * Alcance (cliente-only, sin backend todavía): el envío no sale del
 * navegador. Se registra el acto de compartir para que el flujo quede
 * completo y verificable en la demo; cuando exista el API real
 * (POST /api/avistamientos/{id}/compartir) este módulo debe reemplazar
 * la escritura en localStorage por la llamada al servicio, manteniendo
 * la misma interfaz pública.
 *
 * Solo se ofrecen investigadores verificados: un voluntario no aparece
 * como destinatario porque la US habla de "colegas investigadores".
 */
window.FaunaCompartidos = (function () {
  var KEY = 'faunaCompartidos';

  /**
   * Directorio de colegas de demostración. Mientras no exista backend no
   * hay forma de listar a los usuarios reales de la plataforma: el
   * registro guarda un único usuario en "faunaUser". Esta lista cumple
   * ese papel y queda documentada como dato de muestra, no como usuarios
   * reales del sistema.
   */
  var COLEGAS = [
    { id: 'col-1', nombre: 'Dra. Ana Ruiz', institucion: 'SERNANP', especialidad: 'mamifero' },
    { id: 'col-2', nombre: 'Luis Paredes', institucion: 'UNSAAC', especialidad: 'mamifero' },
    { id: 'col-3', nombre: 'María Vargas', institucion: 'CORBIDI', especialidad: 'ave' },
    { id: 'col-4', nombre: 'Dr. Jorge Santos', institucion: 'UPCH', especialidad: 'reptil' }
  ];

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

  /** Colegas disponibles; si se pasa una especialidad, esa va primero. */
  function colegas(especialidadPreferida) {
    if (!especialidadPreferida) return COLEGAS.slice();
    return COLEGAS.slice().sort(function (a, b) {
      var pa = a.especialidad === especialidadPreferida ? 0 : 1;
      var pb = b.especialidad === especialidadPreferida ? 0 : 1;
      return pa - pb;
    });
  }

  /** Envíos registrados para un avistamiento, del más reciente al más antiguo. */
  function getByAvistamiento(avistamientoId) {
    return getAll()
      .filter(function (c) { return c.avistamientoId === avistamientoId; })
      .sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  }

  /**
   * Registra el envío de un avistamiento a uno o más colegas.
   * @param {string} avistamientoId
   * @param {Array<string>} colegasIds
   * @param {string} mensaje
   * @param {Object} autor - usuario de la sesión (faunaUser)
   * @returns {Object|null} el envío guardado, o null si no hay destinatarios
   */
  function compartir(avistamientoId, colegasIds, mensaje, autor) {
    if (!avistamientoId || !colegasIds || colegasIds.length === 0) return null;

    var destinatarios = COLEGAS.filter(function (c) {
      return colegasIds.indexOf(c.id) !== -1;
    });
    if (destinatarios.length === 0) return null;

    var envio = {
      id: 'sh-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      avistamientoId: avistamientoId,
      destinatarios: destinatarios,
      mensaje: (mensaje || '').trim(),
      fecha: new Date().toISOString(),
      compartidoPor: autor ? { nombre: autor.nombre, email: autor.email } : null
    };

    var lista = getAll();
    lista.unshift(envio);
    saveAll(lista);
    return envio;
  }

  return {
    colegas: colegas,
    getByAvistamiento: getByAvistamiento,
    compartir: compartir
  };
})();
