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

  const searchInput = document.getElementById('catalogoSearch');
  const estadoSelect = document.getElementById('filtroEstado');
  const cards = document.querySelectorAll('.especie-card');

  function filter() {
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const est = estadoSelect ? estadoSelect.value : '';
    cards.forEach(function (card) {
      const nombre = (card.dataset.nombre || '').toLowerCase();
      const cardEst = card.dataset.estado || '';
      const matchNombre = !q || nombre.includes(q);
      const matchEst = !est || cardEst === est;
      card.classList.toggle('hidden', !(matchNombre && matchEst));
    });
  }

  searchInput && searchInput.addEventListener('input', filter);
  estadoSelect && estadoSelect.addEventListener('change', filter);
});
