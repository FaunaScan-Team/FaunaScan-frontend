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

  const datos = {
    'Reporte Mayo 2026': { avistamientos: 42, especies: 18, criticas: 3, zona: 'Bosque el Olivar', periodo: '01 - 08 Mayo 2026', especieTop: 'Iguana verde (14 av.)', alertas: '3 alertas críticas', validados: '94%', investigador: 'Jose Aguilar', sub: 'Bosque El Olivar · Mayo 2026 · Generado: 08/05/2026' },
    'Reporte Abril 2026': { avistamientos: 38, especies: 16, criticas: 2, zona: 'Múltiples zonas', periodo: '01 - 30 Abril 2026', especieTop: 'Cóndor andino (11 av.)', alertas: '2 alertas críticas', validados: '91%', investigador: 'Jose Aguilar', sub: 'Múltiples zonas · Abril 2026 · Generado: 30/04/2026' },
    'Análisis Q1 2026': { avistamientos: 112, especies: 27, criticas: 5, zona: 'Múltiples zonas', periodo: '01 Enero - 31 Marzo 2026', especieTop: 'Oso de anteojos (22 av.)', alertas: '5 alertas críticas', validados: '88%', investigador: 'Jose Aguilar', sub: 'Resumen trimestral · Q1 2026 · Generado: 01/04/2026' },
    'Reporte de alertas - Mar 2026': { avistamientos: 19, especies: 5, criticas: 5, zona: 'Zonas críticas', periodo: 'Marzo 2026', especieTop: 'Jaguar (5 av.)', alertas: '5 alertas críticas', validados: '96%', investigador: 'Jose Aguilar', sub: '5 especies en estado crítico · Generado: 31/03/2026' }
  };

  function actualizarPreview(titulo) {
    const d = datos[titulo];
    if (!d) return;
    document.getElementById('previewTitulo').textContent = titulo;
    document.getElementById('pdfSub').textContent = d.sub;
    document.getElementById('pdfAvistamientos').textContent = d.avistamientos;
    document.getElementById('pdfEspecies').textContent = d.especies;
    document.getElementById('pdfCriticas').textContent = d.criticas;
    document.getElementById('pdfZona').textContent = d.zona;
    document.getElementById('pdfPeriodo').textContent = d.periodo;
    document.getElementById('pdfEspecieTop').textContent = d.especieTop;
    document.getElementById('pdfAlertas').textContent = d.alertas;
    document.getElementById('pdfValidados').textContent = d.validados;
    document.getElementById('pdfInvestigador').textContent = d.investigador;
  }

  document.querySelectorAll('.misrep-item').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.misrep-item').forEach(function (i) { i.classList.remove('misrep-item--active'); });
      item.classList.add('misrep-item--active');
      actualizarPreview(item.dataset.titulo);
    });
  });

  const btnCompartir = document.getElementById('btnCompartir');
  if (btnCompartir) {
    btnCompartir.addEventListener('click', function () {
      btnCompartir.textContent = 'Enlace copiado';
      setTimeout(function () { btnCompartir.textContent = 'Compartir'; }, 1500);
    });
  }

  const btnDescargar = document.getElementById('btnDescargarPdf');
  if (btnDescargar) {
    btnDescargar.addEventListener('click', function () {
      btnDescargar.textContent = 'Generando PDF';
      setTimeout(function () { btnDescargar.textContent = 'Descargar en PDF'; }, 1200);
    });
  }
});
