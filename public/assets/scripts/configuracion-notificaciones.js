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

  document.querySelectorAll('.notifcat-row input[type="checkbox"]').forEach(function (chk) {
    chk.addEventListener('change', function () {
      const row = chk.closest('.notifcat-row');
      const previewItem = document.querySelector('.vista-previa__item[data-category="' + row.dataset.category + '"]');
      if (previewItem) previewItem.classList.toggle('vista-previa__item--off', !chk.checked);
    });
  });

  const btnGuardar = document.getElementById('btnGuardarNotif');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
      btnGuardar.textContent = 'Guardado';
      setTimeout(function () { btnGuardar.textContent = 'Guardar'; }, 1500);
    });
  }
});
