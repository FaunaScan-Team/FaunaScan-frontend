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

  const meses = document.querySelectorAll('.mes-item');
  const titulo = document.getElementById('resumenTitulo');

  meses.forEach(function (mes) {
    mes.addEventListener('click', function () {
      meses.forEach(function (m) { m.classList.remove('mes-item--active'); });
      mes.classList.add('mes-item--active');
      const name = mes.querySelector('.mes-item__name');
      if (titulo && name) titulo.textContent = 'Resumen — ' + name.textContent;
    });
  });

  if (meses.length > 0) meses[0].classList.add('mes-item--active');
});
