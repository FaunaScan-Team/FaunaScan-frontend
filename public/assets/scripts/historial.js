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

  const ESTADO_BADGE = {
    'Validado': { clase: 'badge-green', texto: 'VALIDADO' },
    'Pendiente': { clase: 'badge-yellow', texto: 'PENDIENTE' },
    'No Validado': { clase: 'badge-gray', texto: 'NO VALIDADO' },
    'Rechazado': { clase: 'badge-gray', texto: 'RECHAZADO' }
  };

  function formatearFecha(valor) {
    if (!valor) return '—';
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return valor;
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const tbody = document.getElementById('historialTableBody');
  const historialEmpty = document.getElementById('historialEmpty');
  const historialSinResultados = document.getElementById('historialSinResultados');
  const usuario = JSON.parse(localStorage.getItem('faunaUser') || 'null');

  function misAvistamientos() {
    if (!window.FaunaAvistamientos || !usuario) return [];
    return window.FaunaAvistamientos.getAll().filter(function (a) {
      return a.registradoPor && a.registradoPor.email === usuario.email;
    });
  }

  function renderFilas() {
    if (!tbody) return;
    const lista = misAvistamientos();
    tbody.innerHTML = '';

    if (lista.length === 0) {
      if (historialEmpty) historialEmpty.style.display = 'block';
      if (historialSinResultados) historialSinResultados.style.display = 'none';
      renderFavoritos();
      return;
    }
    if (historialEmpty) historialEmpty.style.display = 'none';

    lista.forEach(function (av) {
      const especie = av.especie || {};
      const estadoInfo = ESTADO_BADGE[av.estadoValidacion] || ESTADO_BADGE['Pendiente'];
      const tr = document.createElement('tr');
      tr.className = 'historial-row';
      tr.dataset.id = av.id;
      tr.dataset.especie = especie.nombre || '';
      tr.dataset.zona = av.area || '';
      tr.dataset.estado = av.estadoValidacion || 'Pendiente';
      tr.style.cursor = 'pointer';
      tr.innerHTML =
        '<td><button type="button" class="fav-btn" data-id="' + av.id + '">' + (av.favorito ? '★' : '☆') + '</button></td>' +
        '<td><span class="especie-emoji">' + (especie.emoji || '🐾') + '</span> ' + (especie.nombre || 'Especie no especificada') + '</td>' +
        '<td>' + (av.area || '—') + '</td>' +
        '<td>' + formatearFecha(av.fecha) + '</td>' +
        '<td><span class="badge ' + estadoInfo.clase + '">' + estadoInfo.texto + '</span></td>';
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.fav-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const id = btn.dataset.id;
        const av = window.FaunaAvistamientos.getById(id);
        const nuevoFavorito = !(av && av.favorito);
        window.FaunaAvistamientos.update(id, { favorito: nuevoFavorito });
        btn.textContent = nuevoFavorito ? '★' : '☆';
        renderFavoritos();
      });
    });

    tbody.querySelectorAll('.historial-row').forEach(function (row) {
      row.addEventListener('click', function () {
        window.location.href = 'detalle-avistamiento.html?id=' + encodeURIComponent(row.dataset.id);
      });
    });

    aplicarFiltros();
  }

  function renderFavoritos() {
    const lista = document.getElementById('favoritosList');
    const vacio = document.getElementById('favoritosEmpty');
    if (!lista) return;
    lista.querySelectorAll('.favorito-item').forEach(function (el) { el.remove(); });
    const favoritos = misAvistamientos().filter(function (a) { return a.favorito; });
    favoritos.forEach(function (av) {
      const especie = av.especie || {};
      const item = document.createElement('div');
      item.className = 'favorito-item';
      item.innerHTML = '<span class="especie-emoji">' + (especie.emoji || '🐾') + '</span>' +
        '<span class="favorito-item__nombre">' + (especie.nombre || 'Especie no especificada') + '</span>' +
        '<span class="favorito-item__zona">📍 ' + (av.area || '—') + '</span>';
      lista.appendChild(item);
    });
    if (vacio) vacio.style.display = favoritos.length ? 'none' : 'block';
  }

  function aplicarFiltros() {
    const animal = (document.getElementById('filtroAnimal').value || '').toLowerCase().trim();
    const zona = (document.getElementById('filtroZona').value || '').toLowerCase().trim();
    const estado = document.getElementById('filtroEstadoHistorial').value;
    let visibles = 0;
    const filas = document.querySelectorAll('.historial-row');
    filas.forEach(function (row) {
      const especieRow = (row.dataset.especie || '').toLowerCase();
      const zonaRow = (row.dataset.zona || '').toLowerCase();
      const estadoRow = (row.dataset.estado || '').toLowerCase().replace(/\s+/g, '-');
      const matchAnimal = !animal || especieRow.includes(animal);
      const matchZona = !zona || zonaRow.includes(zona);
      const matchEstado = !estado || estadoRow === estado;
      const visible = matchAnimal && matchZona && matchEstado;
      row.style.display = visible ? '' : 'none';
      if (visible) visibles++;
    });
    if (historialSinResultados) {
      historialSinResultados.style.display = (filas.length > 0 && visibles === 0) ? 'block' : 'none';
    }
    return visibles;
  }

  renderFilas();

  const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
  if (btnAplicarFiltros) {
    btnAplicarFiltros.addEventListener('click', function () {
      const visibles = aplicarFiltros();
      btnAplicarFiltros.textContent = visibles ? 'Aplicar filtros' : 'Sin resultados — Aplicar filtros';
      setTimeout(function () { btnAplicarFiltros.textContent = 'Aplicar filtros'; }, 1800);
    });
  }
});
