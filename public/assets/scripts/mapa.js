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

  
  const card = document.getElementById('mapaCard');
  const cardEmoji = document.getElementById('cardEmoji');
  const cardNombre = document.getElementById('cardNombre');
  const cardCientifico = document.getElementById('cardCientifico');
  const cardZona = document.getElementById('cardZona');
  const cardEstado = document.getElementById('cardEstado');

  function mostrarInfo(el) {
    if (!card || !el) return;
    cardEmoji.textContent = el.dataset.emoji || '🐾';
    cardNombre.textContent = el.dataset.nombre || '';
    cardCientifico.textContent = el.dataset.cientifico || '';
    cardZona.textContent = el.dataset.zona || '';
    cardEstado.textContent = el.dataset.estado || '';
    card.classList.remove('hidden');
  }

  document.querySelectorAll('.mapa-pin, .mapa-mock__paw').forEach(function (pin) {
    pin.addEventListener('click', function () { mostrarInfo(pin); });
  });

  
  const filtroInput = document.getElementById('mapaFiltroInput');
  if (filtroInput) {
    filtroInput.addEventListener('input', function () {
      const q = filtroInput.value.toLowerCase().trim();
      document.querySelectorAll('.mapa-pin, .mapa-mock__paw').forEach(function (pin) {
        const nombre = (pin.dataset.nombre || '').toLowerCase();
        pin.style.display = (!q || nombre.includes(q)) ? '' : 'none';
      });
    });
  }

  
  const terrain = document.getElementById('mapaTerrain');
  const pinsLayer = document.getElementById('mapaPinsLayer');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnLocate = document.getElementById('btnLocate');
  const zoomBadge = document.getElementById('mapaZoomBadge');

  const ZOOM_MIN = 0.6;
  const ZOOM_MAX = 2.5;
  const ZOOM_STEP = 0.25;
  const GRID_BASE = 64;
  let zoomLevel = 1;

  function aplicarZoom() {
    if (!terrain) return;

    terrain.style.setProperty('--grid-size', (GRID_BASE * zoomLevel) + 'px');

    if (pinsLayer) pinsLayer.style.transform = 'scale(' + zoomLevel + ')';
    if (zoomBadge) zoomBadge.textContent = 'Zoom: ' + Math.round(zoomLevel * 100) + '%';
  }

  if (btnZoomIn && terrain) {
    btnZoomIn.addEventListener('click', function () {
      zoomLevel = Math.min(ZOOM_MAX, +(zoomLevel + ZOOM_STEP).toFixed(2));
      aplicarZoom();
    });
  }
  if (btnZoomOut && terrain) {
    btnZoomOut.addEventListener('click', function () {
      zoomLevel = Math.max(ZOOM_MIN, +(zoomLevel - ZOOM_STEP).toFixed(2));
      aplicarZoom();
    });
  }
  if (btnLocate && terrain) {
    btnLocate.addEventListener('click', function () {
      zoomLevel = 1;
      aplicarZoom();
      const paw = document.getElementById('btnMapaPaw');
      if (paw) mostrarInfo(paw);
    });
  }
  aplicarZoom();


  const btnCalor = document.getElementById('btnToggleCalor');
  if (btnCalor && terrain) {
    btnCalor.addEventListener('click', function () {
      const activo = terrain.classList.toggle('calor-on');
      btnCalor.classList.toggle('active', activo);
    });
  }
});
