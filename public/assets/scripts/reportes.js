document.addEventListener('DOMContentLoaded', function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar__link').forEach(function (link) {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

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

  const btnGenerar = document.getElementById('btnGenerar');
  const bannerTitle = document.querySelector('.reporte-banner__title');
  const bannerSub = document.querySelector('.reporte-banner__sub');
  if (btnGenerar) {
    btnGenerar.addEventListener('click', function () {
      btnGenerar.textContent = 'Generando...';
      btnGenerar.disabled = true;
      setTimeout(function () {
        const area = document.getElementById('reporteArea');
        const desde = document.getElementById('reporteDesde');
        const hasta = document.getElementById('reporteHasta');
        const tipo = document.getElementById('reporteTipo');
        if (bannerTitle && tipo) bannerTitle.textContent = tipo.options[tipo.selectedIndex].text + (area && area.value ? ' — ' + area.value : '');
        if (bannerSub) {
          const zona = area && area.value ? area.value : 'Bosque El Olivar';
          const rango = (desde && desde.value ? desde.value : '01/04/2026') + ' al ' + (hasta && hasta.value ? hasta.value : '08/05/2026');
          bannerSub.textContent = zona + ' · ' + rango;
        }
        btnGenerar.textContent = 'Generar reporte';
        btnGenerar.disabled = false;
      }, 1200);
    });
  }

  const btnGuardarReporte = document.getElementById('btnGuardarReporte');
  if (btnGuardarReporte) {
    btnGuardarReporte.addEventListener('click', function () {
      btnGuardarReporte.textContent = 'Guardado';
      btnGuardarReporte.disabled = true;
      setTimeout(function () {
        btnGuardarReporte.textContent = 'Guardar reporte';
        btnGuardarReporte.disabled = false;
      }, 1500);
    });
  }
});
