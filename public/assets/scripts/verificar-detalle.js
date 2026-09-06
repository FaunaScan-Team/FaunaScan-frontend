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

  const registro = JSON.parse(localStorage.getItem('faunaVerificarDetalle') || 'null');
  if (registro) {
    document.getElementById('verdetNombre').textContent = registro.nombre || 'Oso de Anteojos';
    document.getElementById('verdetCientifico').textContent = registro.cientifico || 'Tremarctos ornatus';
    if (registro.imagen) { document.getElementById('verdetFoto').innerHTML = '<img src="' + registro.imagen + '" alt="' + registro.nombre + '">';}
    document.getElementById('verdetBannerFoto').textContent = registro.emoji || '🐻';
    document.getElementById('verdetZona').textContent = registro.zona || 'Bosque El Olivar';
    if (registro.observacion) document.getElementById('verdetObservacion').textContent = registro.observacion;
  }

  const btnValidar = document.getElementById('btnValidarDetalle');
  if (btnValidar) {
    btnValidar.addEventListener('click', function () {
      btnValidar.textContent = 'Validando';
      btnValidar.disabled = true;
      setTimeout(function () { window.location.href = 'verificar.html'; }, 600);
    });
  }
});
