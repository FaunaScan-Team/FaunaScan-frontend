/**
 * mi-contribucion.js
 * FaunaScan Perú — US58: versión simplificada de reportes para voluntario.
 * Todas las métricas se calculan sobre los avistamientos reales del
 * usuario autenticado (mismo store que usa registrar/historial), sin
 * exportación a PDF, institución ni comparación con otros usuarios.
 */
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      overlay && overlay.classList.toggle('open');
    });
    overlay && overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  const U = window.FaunaReportesUtils;
  const usuario = JSON.parse(localStorage.getItem('faunaUser') || 'null');

  function misAvistamientos() {
    if (!window.FaunaAvistamientos || !usuario) return [];
    return window.FaunaAvistamientos.getAll().filter(function (a) {
      return a.registradoPor && a.registradoPor.email === usuario.email;
    });
  }

  const lista = misAvistamientos();

  document.getElementById('metricAvistamientos').textContent = lista.length;
  document.getElementById('metricEspecies').textContent = U.especiesUnicas(lista).size;
  document.getElementById('metricZonas').textContent = U.zonasUnicas(lista).size;

  const timeline = document.getElementById('contribTimeline');
  const vacio = document.getElementById('contribEmpty');
  const ordenados = lista.slice().sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });

  if (ordenados.length === 0) {
    vacio.style.display = 'block';
  } else {
    ordenados.slice(0, 5).forEach(function (av) {
      const especie = av.especie || {};
      const fecha = new Date(av.fecha);
      const fechaTexto = isNaN(fecha.getTime()) ? '—' : fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
      const item = document.createElement('div');
      item.className = 'contrib-timeline-item';
      const thumb = (av.foto && av.foto.src)
        ? '<img src="' + av.foto.src + '" alt="">'
        : (especie.emoji || '🐾');
      item.innerHTML =
        '<div class="contrib-timeline-item__thumb">' + thumb + '</div>' +
        '<div class="contrib-timeline-item__info">' +
          '<p class="contrib-timeline-item__nombre">' + (especie.nombre || 'Especie no especificada') + '</p>' +
          '<p class="contrib-timeline-item__meta">' + fechaTexto + (av.area ? ' · ' + av.area : '') + '</p>' +
        '</div>';
      timeline.appendChild(item);
    });
  }

  // Insignias por cantidad de avistamientos: umbral simple y consistente
  // (no es un dato inventado por usuario, es la misma regla para todos).
  const UMBRALES = [5, 10, 25, 50, 100];
  const total = lista.length;
  const siguiente = UMBRALES.find(function (u) { return u > total; });
  const tituloEl = document.getElementById('motivacionTitulo');
  const subEl = document.getElementById('motivacionSub');
  const barraEl = document.getElementById('motivacionBarra');

  if (total === 0) {
    tituloEl.textContent = '¡Empieza tu contribución!';
    subEl.textContent = 'Registra tu primer avistamiento para ganar tu primera insignia.';
    barraEl.style.width = '0%';
  } else if (!siguiente) {
    tituloEl.textContent = '¡Impresionante!';
    subEl.textContent = 'Superaste los ' + UMBRALES[UMBRALES.length - 1] + ' avistamientos registrados.';
    barraEl.style.width = '100%';
  } else {
    const anterior = UMBRALES[UMBRALES.indexOf(siguiente) - 1] || 0;
    const faltan = siguiente - total;
    const progreso = Math.round(((total - anterior) / (siguiente - anterior)) * 100);
    tituloEl.textContent = '¡Sigue así!';
    subEl.textContent = 'Estás a ' + faltan + ' registro' + (faltan === 1 ? '' : 's') + ' de tu próxima insignia (' + siguiente + ').';
    barraEl.style.width = progreso + '%';
  }
});
