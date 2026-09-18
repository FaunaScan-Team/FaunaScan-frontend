/**
 * actividades.js
 * FaunaScan Perú — Actividad reciente de la comunidad (detalle del
 * "Ver más" de los paneles principales).
 *
 * Antes la pantalla traía ocho registros escritos en el HTML, con
 * usuarios que no existen (Sergio E., Roberto S., Kevin A.), especies
 * que no están en el catálogo de la app (Gallito de las Rocas, Vizcacha
 * Peruana, Paiche, Nutria Gigante, Zorro Andino), coordenadas
 * inventadas y fotos "...VerMas.png" fijas. El panel de detalle además
 * dibujaba un "mapa" que era solo un degradado CSS con una etiqueta de
 * texto encima.
 *
 * Ahora la lista son los avistamientos reales de FaunaAvistamientos
 * (toda la comunidad, más recientes primero) y el detalle muestra la
 * foto adjunta real, quién lo registró y un mini mapa Leaflet centrado
 * en las coordenadas del avistamiento — el mismo enfoque que ya usa
 * mapa.js. Si el registro no tiene coordenadas se dice explícitamente
 * en vez de mostrar un mapa que no corresponde a nada.
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

  const lista = document.getElementById('actividadesList');
  const vacio = document.getElementById('actividadesEmpty');
  const detalle = document.getElementById('actividadDetalle');
  const detEspecie = document.getElementById('detEspecie');
  const detFoto = document.getElementById('detFoto');
  const detTexto = document.getElementById('detTexto');
  const detLugar = document.getElementById('detLugar');
  const detMapa = document.getElementById('detMapa');
  const detSinCoords = document.getElementById('detSinCoords');
  const detCoords = document.getElementById('detCoords');
  const detLat = document.getElementById('detLat');
  const detLng = document.getElementById('detLng');

  const todos = (window.FaunaAvistamientos ? window.FaunaAvistamientos.getAll() : [])
    .slice()
    .sort(function (a, b) {
      return new Date(b.creadoEn || b.fecha) - new Date(a.creadoEn || a.fecha);
    });

  if (todos.length === 0) {
    vacio.style.display = 'block';
    detalle.style.display = 'none';
    return;
  }

  let mapa = null;
  let marcador = null;

  function pintarMapa(lat, lng) {
    // zoomAnimation:false por el mismo motivo que en mapa.js: las
    // transiciones animadas de Leaflet no completan de forma fiable
    // dentro del panel.
    if (!mapa) {
      mapa = L.map(detMapa, { zoomControl: false, attributionControl: false, zoomAnimation: false })
        .setView([lat, lng], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapa);
    } else {
      mapa.setView([lat, lng], 12);
    }
    if (marcador) mapa.removeLayer(marcador);
    marcador = L.marker([lat, lng]).addTo(mapa);
    // El contenedor puede no tener todavía su tamaño final cuando se
    // pinta el primer detalle; sin esto Leaflet deja sin tiles la parte
    // derecha del panel.
    requestAnimationFrame(function () { mapa.invalidateSize(); });
  }

  function nombreAutor(autor) {
    if (!autor || !autor.nombre) return 'Usuario sin identificar';
    return autor.nombre + (autor.apellido ? ' ' + autor.apellido.charAt(0) + '.' : '');
  }

  function mostrarDetalle(av, item) {
    lista.querySelectorAll('.actividad-item').forEach(function (i) {
      i.classList.remove('actividad-item--active');
    });
    item.classList.add('actividad-item--active');

    const especie = av.especie || {};
    detEspecie.textContent = especie.nombre || 'Especie no especificada';

    detFoto.innerHTML = '';
    const tieneFoto = !!(av.foto && av.foto.src);
    detFoto.classList.toggle('actividad-detalle__foto--sin-foto', !tieneFoto);
    if (tieneFoto) {
      const img = document.createElement('img');
      img.className = 'actividad-detalle__img';
      img.src = av.foto.src;
      img.alt = especie.nombre || '';
      detFoto.appendChild(img);
    } else {
      detFoto.textContent = especie.emoji || '🐾';
    }

    const fecha = new Date(av.fecha);
    const fechaTexto = isNaN(fecha.getTime())
      ? ''
      : fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
    detTexto.textContent = nombreAutor(av.registradoPor) + ' registró ' +
      (especie.nombre || 'una especie no especificada') + (fechaTexto ? ' · ' + fechaTexto : '');
    detLugar.textContent = av.area ? '📍 ' + av.area : 'Sin área especificada';

    const tieneCoords = av.lat != null && av.lng != null;
    detMapa.style.display = tieneCoords ? 'block' : 'none';
    detCoords.style.display = tieneCoords ? 'flex' : 'none';
    detSinCoords.style.display = tieneCoords ? 'none' : 'block';
    if (tieneCoords) {
      detLat.textContent = Number(av.lat).toFixed(4);
      detLng.textContent = Number(av.lng).toFixed(4);
      pintarMapa(Number(av.lat), Number(av.lng));
    }
  }

  let primerItem = null;

  todos.forEach(function (av) {
    const especie = av.especie || {};
    const item = document.createElement('li');
    item.className = 'actividad-item';

    if (av.foto && av.foto.src) {
      const img = document.createElement('img');
      img.className = 'actividad-item__img';
      img.src = av.foto.src;
      img.alt = '';
      item.appendChild(img);
    } else {
      const icono = document.createElement('span');
      icono.className = 'actividad-item__icon';
      icono.textContent = especie.emoji || '🐾';
      item.appendChild(icono);
    }

    const info = document.createElement('div');
    info.className = 'actividad-item__info';
    const nombre = document.createElement('p');
    nombre.className = 'actividad-item__nombre';
    nombre.textContent = especie.nombre || 'Especie no especificada';
    const lugar = document.createElement('p');
    lugar.className = 'actividad-item__lugar';
    lugar.textContent = av.area ? '📍 ' + av.area : 'Sin área especificada';
    info.appendChild(nombre);
    info.appendChild(lugar);
    item.appendChild(info);

    item.addEventListener('click', function () { mostrarDetalle(av, item); });
    lista.appendChild(item);

    if (!primerItem) primerItem = item;
  });

  // Solo después de construir la lista completa, para que el panel de
  // detalle (y su mapa) midan con el layout ya definitivo.
  mostrarDetalle(todos[0], primerItem);
});
