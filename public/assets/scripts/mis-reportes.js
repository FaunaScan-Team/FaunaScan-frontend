/**
 * mis-reportes.js
 * FaunaScan Perú — Lista de reportes del investigador autenticado (US51).
 *
 * Antes: 4 tarjetas fijas en el HTML, TODAS atribuidas siempre a "Jose
 * Aguilar" sin importar quién había iniciado sesión -- no existía ningún
 * concepto real de propietario. Ahora la lista se filtra comparando
 * reporte.generadoPor.email contra el correo del usuario autenticado
 * (window.FaunaAuth / localStorage["faunaUser"]) leído contra los reportes
 * reales guardados por reportes.js en FaunaReportes (localStorage
 * "faunaReportes") -- no es un cambio de texto, es un filtro real sobre
 * datos reales.
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

  const TIPO_LABEL = {
    biodiversidad: 'Biodiversidad por área',
    amenazadas: 'Especies amenazadas',
    institucional: 'Institucional'
  };

  const usuario = JSON.parse(localStorage.getItem('faunaUser') || 'null');

  // Filtro real de propiedad (US51): SOLO reportes cuyo generadoPor.email
  // coincide con el usuario autenticado. Nada de "mostrar todos con el
  // nombre cambiado" -- si otro usuario generó reportes, no aparecen aquí.
  function misReportes() {
    if (!usuario) return [];
    return window.FaunaReportes.getAll().filter(function (r) {
      return r.generadoPor && r.generadoPor.email === usuario.email;
    });
  }

  function formatearFecha(iso) {
    const f = new Date(iso);
    if (isNaN(f.getTime())) return '—';
    return f.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const lista = misReportes();
  const contenedor = document.getElementById('misrepListaItems');
  const vacio = document.getElementById('misrepEmpty');
  const hint = document.getElementById('misrepHint');
  const previewCol = document.getElementById('misrepPreviewCol');

  let reporteSeleccionado = null;

  function renderPreview(reporte) {
    reporteSeleccionado = reporte;
    document.getElementById('previewTitulo').textContent = reporte.titulo;
    document.getElementById('pdfSub').textContent = reporte.area + ' · Generado: ' + formatearFecha(reporte.generadoEn);
    document.getElementById('pdfAvistamientos').textContent = reporte.avistamientos;
    document.getElementById('pdfEspecies').textContent = reporte.especies;
    document.getElementById('pdfCriticas').textContent = reporte.criticas;
    document.getElementById('pdfZona').textContent = reporte.area;
    document.getElementById('pdfPeriodo').textContent = reporte.periodo;
    document.getElementById('pdfEspecieTop').textContent = reporte.especieTop;
    document.getElementById('pdfValidados').textContent = reporte.validados + '%';
    document.getElementById('pdfInvestigador').textContent = reporte.generadoPor
      ? (reporte.generadoPor.nombre + ' ' + reporte.generadoPor.apellido)
      : '—';
    previewCol.style.display = 'block';
  }

  function renderLista() {
    contenedor.innerHTML = '';
    if (lista.length === 0) {
      vacio.style.display = 'block';
      if (hint) hint.style.display = 'none';
      previewCol.style.display = 'none';
      return;
    }
    vacio.style.display = 'none';

    lista.forEach(function (reporte, i) {
      const wrap = document.createElement('div');
      wrap.className = 'misrep-item' + (i === 0 ? ' misrep-item--active' : '');
      const verificadoBadge = (reporte.generadoPor && reporte.generadoPor.credencialVerificada)
        ? '<span class="misrep-item__verificado">✓ Investigador verificado</span>' : '';
      const nombreGenerador = reporte.generadoPor ? (reporte.generadoPor.nombre + ' ' + reporte.generadoPor.apellido) : '—';
      wrap.innerHTML =
        '<span class="misrep-item__icon misrep-item__icon--green">📊</span>' +
        '<span class="misrep-item__info">' +
          '<span class="misrep-item__titulo">' + reporte.titulo + '</span>' +
          '<span class="misrep-item__badge">' + (TIPO_LABEL[reporte.tipo] || reporte.tipo) + '</span>' +
          '<span class="misrep-item__meta">' + formatearFecha(reporte.generadoEn) + ' · ' + nombreGenerador + ' ' + verificadoBadge + '</span>' +
          '<span class="misrep-item__acciones">' +
            '<button type="button" class="misrep-item__accion" data-accion="ver">Ver</button>' +
            '<button type="button" class="misrep-item__accion" data-accion="pdf">Exportar PDF</button>' +
            '<button type="button" class="misrep-item__accion" data-accion="compartir">Compartir</button>' +
          '</span>' +
        '</span>';

      function seleccionar() {
        contenedor.querySelectorAll('.misrep-item').forEach(function (el) { el.classList.remove('misrep-item--active'); });
        wrap.classList.add('misrep-item--active');
        renderPreview(reporte);
      }

      wrap.addEventListener('click', seleccionar);
      wrap.querySelectorAll('.misrep-item__accion').forEach(function (accionBtn) {
        accionBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          seleccionar();
          if (accionBtn.dataset.accion === 'pdf') window.print();
          if (accionBtn.dataset.accion === 'compartir') document.getElementById('btnCompartir').click();
        });
      });

      contenedor.appendChild(wrap);
    });

    renderPreview(lista[0]);
  }

  renderLista();

  const btnCompartir = document.getElementById('btnCompartir');
  if (btnCompartir) {
    btnCompartir.addEventListener('click', function () {
      if (!reporteSeleccionado) return;
      const resumen = reporteSeleccionado.titulo + ' — ' + reporteSeleccionado.avistamientos +
        ' avistamientos, ' + reporteSeleccionado.especies + ' especies, ' +
        reporteSeleccionado.validados + '% validados. Generado por ' +
        (reporteSeleccionado.generadoPor ? reporteSeleccionado.generadoPor.nombre + ' ' + reporteSeleccionado.generadoPor.apellido : '—') +
        ' el ' + formatearFecha(reporteSeleccionado.generadoEn) + '.';
      navigator.clipboard.writeText(resumen).then(function () {
        btnCompartir.textContent = 'Resumen copiado ✓';
      }).catch(function () {
        btnCompartir.textContent = 'No se pudo copiar';
      });
      setTimeout(function () { btnCompartir.textContent = 'Compartir'; }, 1800);
    });
  }

  const btnDescargar = document.getElementById('btnDescargarPdf');
  if (btnDescargar) {
    btnDescargar.addEventListener('click', function () {
      window.print();
    });
  }
  const btnImprimir = document.getElementById('btnImprimir');
  if (btnImprimir) {
    btnImprimir.addEventListener('click', function () {
      window.print();
    });
  }
});
