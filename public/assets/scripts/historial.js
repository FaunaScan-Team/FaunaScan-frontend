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

  function renderFavoritos() {
    const lista = document.getElementById('favoritosList');
    const vacio = document.getElementById('favoritosEmpty');
    if (!lista) return;
    const favRows = document.querySelectorAll('.historial-row');
    lista.querySelectorAll('.favorito-item').forEach(function (el) { el.remove(); });
    let count = 0;
    favRows.forEach(function (row) {
      const btn = row.querySelector('.fav-btn');
      if (btn && btn.textContent === '★') {
        count++;
        const item = document.createElement('div');
        item.className = 'favorito-item';
        item.innerHTML = '<span class="especie-emoji">' + row.dataset.emoji + '</span>' +
          '<span class="favorito-item__nombre">' + row.dataset.especie + '</span>' +
          '<span class="favorito-item__zona">📍 ' + row.dataset.zona + '</span>';
        lista.appendChild(item);
      }
    });
    if (vacio) vacio.style.display = count ? 'none' : 'block';
  }

  document.querySelectorAll('.fav-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      btn.textContent = btn.textContent === '☆' ? '★' : '☆';
      renderFavoritos();
    });
  });

  document.querySelectorAll('.historial-row').forEach(function (row) {
    row.style.cursor = 'pointer';
    row.addEventListener('click', function () {
      localStorage.setItem('faunaRegistroDetalle', JSON.stringify({
        nombre: row.dataset.especie,
        cientifico: row.dataset.cientifico,
        emoji: row.dataset.emoji,
        zona: row.dataset.zona,
        estado: row.dataset.estado,
        imagen: row.dataset.imagen
      }));
      window.location.href = 'detalle-avistamiento.html';
    });
  });

  renderFavoritos();

  const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
  if (btnAplicarFiltros) {
    btnAplicarFiltros.addEventListener('click', function () {
      const animal = (document.getElementById('filtroAnimal').value || '').toLowerCase().trim();
      const zona = (document.getElementById('filtroZona').value || '').toLowerCase().trim();
      const estado = document.getElementById('filtroEstadoHistorial').value;
      let visibles = 0;
      document.querySelectorAll('.historial-row').forEach(function (row) {
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
      btnAplicarFiltros.textContent = visibles ? 'Aplicar filtros' : 'Sin resultados — Aplicar filtros';
      setTimeout(function () { btnAplicarFiltros.textContent = 'Aplicar filtros'; }, 1800);
    });
  }
});
