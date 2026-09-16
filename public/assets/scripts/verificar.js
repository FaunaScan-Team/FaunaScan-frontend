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

  document.querySelectorAll('.btn-validar').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.verificar-item');
      const badge = item && item.querySelector('.status-badge');
      if (badge) {
        badge.textContent = 'VALIDADO';
        badge.className = 'badge badge-green status-badge';
      }
      btn.disabled = true;
      const reject = item && item.querySelector('.btn-rechazar');
      if (reject) reject.disabled = true;
    });
  });

  document.querySelectorAll('.btn-rechazar').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.verificar-item');
      if (item) item.classList.add('dimmed');
      const badge = item && item.querySelector('.status-badge');
      if (badge) {
        badge.textContent = 'RECHAZADO';
        badge.className = 'badge badge-gray status-badge';
      }
      btn.disabled = true;
      const validate = item && item.querySelector('.btn-validar');
      if (validate) validate.disabled = true;
    });
  });

  document.querySelectorAll('.verificar-item__img--clickable').forEach(function (img) {
    img.addEventListener('click', function () {
      const item = img.closest('.verificar-item');
      if (!item) return;
      const foto = img.querySelector('img');
      const nombre = item.querySelector('.verificar-item__nombre').textContent.trim();

      let emoji;
      if (nombre === 'Oso de anteojos') {
          emoji = '🐻';
      } else if (nombre === 'Anaconda verde') {
          emoji = '🐍';
      } else if (nombre === 'Cóndor andino') {
          emoji = '🦅';
      }
      localStorage.setItem('faunaVerificarDetalle', JSON.stringify({
        nombre: item.querySelector('.verificar-item__nombre').textContent,
        cientifico: item.querySelector('.verificar-item__cientifico').textContent,
        observacion: item.querySelector('.verificar-item__obs').textContent,
        imagen: foto.src,
        emoji: emoji,
        zona: img.dataset.zona
      }));
      window.location.href = 'verificar-detalle.html';
    });
  });
});
