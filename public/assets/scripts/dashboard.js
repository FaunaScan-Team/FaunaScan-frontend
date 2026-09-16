document.addEventListener('DOMContentLoaded', function () {

  var user = JSON.parse(localStorage.getItem('faunaUser') || 'null');
  var nameEl = document.querySelector('#welcomeName');
  if (user && nameEl) {
    nameEl.textContent = 'Bienvenido de regreso, ' + user.nombre;
  }

  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  var toggle  = document.querySelector('.sidebar-toggle');

  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  var currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar__link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href === currentPage) { link.classList.add('active'); }
  });
});