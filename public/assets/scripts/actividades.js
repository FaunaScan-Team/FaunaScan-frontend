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

  const items = document.querySelectorAll('.actividad-item');
  const detEspecie = document.getElementById('detEspecie');
  const detFoto = document.getElementById('detFoto');
  const detTexto = document.getElementById('detTexto');
  const detLugar = document.getElementById('detLugar');
  const detZona = document.getElementById('detZona');
  const detLat = document.getElementById('detLat');
  const detLng = document.getElementById('detLng');

  function showDetalle(item) {
    items.forEach(function (i) { i.classList.remove('actividad-item--active'); });
    item.classList.add('actividad-item--active');
    const d = item.dataset;
    detEspecie.textContent = d.especie;
    detFoto.innerHTML = `<img src="${d.imagen}" class="actividad-detalle__img" alt="">`;
    detTexto.textContent = d.usuario + ' registró ' + d.especie + ' · ' + d.zona;
    detLugar.textContent = '📍 ' + d.lugar;
    detZona.textContent = d.zona;
    detLat.textContent = d.lat;
    detLng.textContent = d.lng;
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () { showDetalle(item); });
    const more = item.querySelector('.actividad-item__more');
    if (more) {
      more.addEventListener('click', function (e) {
        e.stopPropagation();
        showDetalle(item);
      });
    }
  });
});
