/**
 * mapa.js
 * FaunaScan Perú — Mapa de avistamientos (US14/US15/US16/US17).
 *
 * Antes esto era un mockup sin ninguna librería de mapas: un fondo CSS
 * simulando terreno y un solo ícono de huella fijo en el centro
 * representando "todos los avistamientos" (2 pines sueltos más, también
 * hardcodeados). US14 exige marcadores individuales reales por
 * avistamiento. Ahora se usa Leaflet + OpenStreetMap (sin necesidad de
 * API key) y los marcadores se generan desde los avistamientos reales
 * guardados en FaunaAvistamientos (mismo store que usan registrar/
 * historial/detalle).
 */
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

  if (typeof L === 'undefined') return; // Leaflet no cargó (sin conexión)

  const CENTRO_PERU = [-9.19, -75.0152];
  const ZOOM_PAIS = 5;

  const map = L.map('mapaLeaflet', { zoomControl: false, zoomAnimation: false }).setView(CENTRO_PERU, ZOOM_PAIS);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);

  const zoomBadge = document.getElementById('mapaZoomBadge');
  function actualizarZoomBadge() {
    if (zoomBadge) zoomBadge.textContent = 'Zoom: ' + map.getZoom();
  }
  map.on('zoomend', actualizarZoomBadge);

  // --- Tarjeta de información (mismo overlay visual que ya existía) ---
  const card = document.getElementById('mapaCard');
  const cardEmoji = document.getElementById('cardEmoji');
  const cardNombre = document.getElementById('cardNombre');
  const cardCientifico = document.getElementById('cardCientifico');
  const cardZona = document.getElementById('cardZona');
  const cardEstado = document.getElementById('cardEstado');

  function mostrarInfo(av) {
    if (!card) return;
    const especie = av.especie || {};
    cardEmoji.textContent = especie.emoji || '🐾';
    cardNombre.textContent = especie.nombre || 'Especie no especificada';
    cardCientifico.textContent = especie.cientifico || '—';
    cardZona.textContent = av.area || 'Zona no especificada';
    cardEstado.textContent = av.estadoValidacion || 'Pendiente';
    card.classList.remove('hidden');
  }

  function colorPorEstadoEspecie(estado) {
    const e = (estado || '').toUpperCase();
    if (e.indexOf('PELIGRO') !== -1) return 'red';
    if (e.indexOf('VULNERABLE') !== -1) return 'yellow';
    return 'green';
  }

  function crearIcono(color) {
    return L.divIcon({
      className: '',
      html: '<div class="mapa-marker mapa-marker--' + color + '" style="width:16px;height:16px;"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  }

  // --- Avistamientos reales con coordenadas ---
  const todos = window.FaunaAvistamientos ? window.FaunaAvistamientos.getAll() : [];
  const conUbicacion = todos.filter(function (av) { return typeof av.lat === 'number' && typeof av.lng === 'number'; });

  const capaMarcadores = L.layerGroup().addTo(map);
  let marcadores = []; // { av, marker }

  function renderMarcadores(filtroTexto) {
    capaMarcadores.clearLayers();
    marcadores = [];
    const q = (filtroTexto || '').toLowerCase().trim();
    conUbicacion.forEach(function (av) {
      const nombre = (av.especie && av.especie.nombre) || '';
      if (q && nombre.toLowerCase().indexOf(q) === -1) return;
      const color = colorPorEstadoEspecie(av.especie && av.especie.estado);
      const marker = L.marker([av.lat, av.lng], { icon: crearIcono(color) });
      marker.on('click', function () { mostrarInfo(av); });
      marker.addTo(capaMarcadores);
      marcadores.push({ av: av, marker: marker });
    });
  }

  renderMarcadores('');

  const mapaEmpty = document.getElementById('mapaEmpty');
  if (conUbicacion.length === 0) {
    if (mapaEmpty) mapaEmpty.style.display = 'block';
  } else {
    const bounds = L.latLngBounds(conUbicacion.map(function (av) { return [av.lat, av.lng]; }));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }
  actualizarZoomBadge();

  // --- Filtro por nombre de especie ---
  const filtroInput = document.getElementById('mapaFiltroInput');
  if (filtroInput) {
    filtroInput.addEventListener('input', function () {
      renderMarcadores(filtroInput.value);
    });
  }

  // --- Controles de zoom / ubicación ---
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnLocate = document.getElementById('btnLocate');

  if (btnZoomIn) btnZoomIn.addEventListener('click', function () { map.zoomIn(); });
  if (btnZoomOut) btnZoomOut.addEventListener('click', function () { map.zoomOut(); });

  let marcadorYo = null;
  if (btnLocate) {
    btnLocate.addEventListener('click', function () {
      if (!navigator.geolocation) return;
      btnLocate.textContent = '…';
      navigator.geolocation.getCurrentPosition(function (pos) {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        if (marcadorYo) map.removeLayer(marcadorYo);
        marcadorYo = L.marker(latlng, { icon: crearIcono('yo') }).addTo(map);
        map.setView(latlng, 13);
        btnLocate.textContent = '◎';
      }, function () {
        btnLocate.textContent = '◎';
      });
    });
  }

  // --- Mapa de calor (US15) ---
  const btnCalor = document.getElementById('btnToggleCalor');
  let capaCalor = null;
  if (btnCalor && typeof L.heatLayer === 'function') {
    btnCalor.addEventListener('click', function () {
      const activo = btnCalor.classList.toggle('active');
      if (activo) {
        const puntos = conUbicacion.map(function (av) { return [av.lat, av.lng, 0.6]; });
        capaCalor = L.heatLayer(puntos, { radius: 30, blur: 25 }).addTo(map);
        map.removeLayer(capaMarcadores);
      } else {
        if (capaCalor) map.removeLayer(capaCalor);
        capaMarcadores.addTo(map);
      }
    });
  }
});
