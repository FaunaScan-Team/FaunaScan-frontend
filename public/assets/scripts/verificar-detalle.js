/**
 * verificar-detalle.js
 * FaunaScan Perú — US45: detalle del avistamiento en revisión.
 *
 * Antes la pantalla mostraba siempre el mismo registro inventado (Oso
 * de Anteojos, "VULNERABLE (VU)", observación escrita a mano, 24 °C,
 * 68% de humedad, 3 individuos, chips "Soleado"/"Grupo familiar",
 * coordenadas -12.0464/-77.0428 y un "mapa" que era un degradado CSS).
 * Los pocos datos dinámicos venían de un objeto armado a mano por
 * verificar.js en localStorage, y el botón "Validar" solo cambiaba su
 * propio texto antes de volver a la cola: no guardaba nada.
 *
 * Ahora el avistamiento se carga por ?id= desde FaunaAvistamientos
 * (igual que detalle-avistamiento.js), todos los campos salen del
 * registro real — incluidas las observaciones de clima/temperatura/
 * humedad/individuos que guarda observaciones.js — y validar/rechazar
 * persiste el estado junto con quién validó y cuándo.
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

  const usuario = window.FaunaAuth ? window.FaunaAuth.user : null;
  const id = new URLSearchParams(window.location.search).get('id');
  const av = id && window.FaunaAvistamientos ? window.FaunaAvistamientos.getById(id) : null;

  if (!av) {
    document.getElementById('verdetLayout').style.display = 'none';
    document.getElementById('verdetNoEncontrado').style.display = 'block';
    return;
  }

  const especie = av.especie || {};

  const foto = document.getElementById('verdetFoto');
  const bannerFoto = document.getElementById('verdetBannerFoto');
  if (av.foto && av.foto.src) {
    foto.innerHTML = '';
    const img = document.createElement('img');
    img.src = av.foto.src;
    img.alt = especie.nombre || '';
    foto.appendChild(img);
    bannerFoto.style.backgroundImage = 'url("' + av.foto.src + '")';
    bannerFoto.textContent = '';
  } else {
    foto.textContent = especie.emoji || '🐾';
    bannerFoto.textContent = especie.emoji || '🐾';
  }

  document.getElementById('verdetNombre').textContent = especie.nombre || 'Especie no especificada';
  document.getElementById('verdetCientifico').textContent = especie.cientifico || '';

  const estadoBadge = document.getElementById('verdetEstado');
  if (especie.estado) {
    estadoBadge.textContent = especie.estado.toUpperCase();
    estadoBadge.style.display = 'inline-block';
  }

  const autor = av.registradoPor;
  document.getElementById('verdetAutor').textContent = autor && autor.nombre
    ? 'Registrado por ' + autor.nombre + (autor.apellido ? ' ' + autor.apellido : '') +
      (av.fecha ? ' · ' + new Date(av.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : '')
    : 'Autor no identificado';

  document.getElementById('verdetZona').textContent = av.area ? '📍 ' + av.area : 'Sin área especificada';

  const obs = av.observaciones || {};
  if (obs.descripcion) {
    document.getElementById('verdetObservacion').textContent = obs.descripcion;
  }

  const chips = document.getElementById('verdetChips');
  if (obs.clima) {
    const chip = document.createElement('span');
    chip.className = 'verdet-chip';
    chip.textContent = obs.clima;
    chips.appendChild(chip);
  }

  document.getElementById('verdetTemp').value = obs.temp || '—';
  document.getElementById('verdetHumedad').value = obs.humedad || '—';
  document.getElementById('verdetIndividuos').value = obs.individuos || '—';

  const tieneCoords = av.lat != null && av.lng != null;
  document.getElementById('verdetMapa').style.display = tieneCoords ? 'block' : 'none';
  document.getElementById('verdetCoords').style.display = tieneCoords ? 'flex' : 'none';
  document.getElementById('verdetSinCoords').style.display = tieneCoords ? 'none' : 'block';

  if (tieneCoords) {
    document.getElementById('verdetLat').textContent = Number(av.lat).toFixed(4);
    document.getElementById('verdetLng').textContent = Number(av.lng).toFixed(4);
    const mapa = L.map('verdetMapa', { zoomControl: false, attributionControl: false, zoomAnimation: false })
      .setView([Number(av.lat), Number(av.lng)], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapa);
    L.marker([Number(av.lat), Number(av.lng)]).addTo(mapa);
    requestAnimationFrame(function () { mapa.invalidateSize(); });
  }

  const acciones = document.getElementById('verdetAcciones');
  const resuelto = document.getElementById('verdetResuelto');

  if (av.estadoValidacion !== 'Pendiente') {
    acciones.style.display = 'none';
    resuelto.textContent = 'Este avistamiento ya fue ' +
      (av.estadoValidacion === 'Validado' ? 'validado' : 'rechazado') +
      (av.validadoPor && av.validadoPor.nombre ? ' por ' + av.validadoPor.nombre : '') + '.';
    resuelto.style.display = 'block';
    return;
  }

  function resolver(nuevoEstado, boton) {
    window.FaunaAvistamientos.update(av.id, {
      estadoValidacion: nuevoEstado,
      validadoPor: usuario ? {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email
      } : null,
      fechaValidacion: new Date().toISOString()
    });
    boton.textContent = nuevoEstado === 'Validado' ? 'Validado' : 'Rechazado';
    acciones.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
    setTimeout(function () { window.location.href = 'verificar.html'; }, 600);
  }

  const btnValidar = document.getElementById('btnValidarDetalle');
  btnValidar.addEventListener('click', function () { resolver('Validado', btnValidar); });
  const btnRechazar = document.getElementById('btnRechazarDetalle');
  btnRechazar.addEventListener('click', function () { resolver('Rechazado', btnRechazar); });
});
