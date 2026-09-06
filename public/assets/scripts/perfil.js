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

  const user = JSON.parse(localStorage.getItem('faunaUser') || 'null');
  const initials = user ? (((user.nombre || '')[0] || '') + ((user.apellido || '')[0] || '')).toUpperCase() : '?';
  if (user) {
    const avatar = document.getElementById('perfilAvatar');
    const nameEl = document.getElementById('perfilName');
    const emailEl = document.getElementById('perfilEmail');
    if (avatar) avatar.textContent = initials || '?';
    if (nameEl) nameEl.textContent = (user.nombre || '') + ' ' + (user.apellido || '');
    if (emailEl) emailEl.textContent = user.email || '';

    const fullNameEl = document.getElementById('perfilFullName');
    const emailInfoEl = document.getElementById('perfilEmailInfo');
    const roleInfoEl = document.getElementById('perfilRoleInfo');
    if (fullNameEl) fullNameEl.textContent = (user.nombre || '') + ' ' + (user.apellido || '');
    if (emailInfoEl) emailInfoEl.textContent = user.email || '';
    if (roleInfoEl) roleInfoEl.textContent = user.rol === 'investigador' ? 'Investigador verificado' : 'Voluntario';
  }

  // --- Modal de cerrar sesión ---
  const btnLogout = document.getElementById('btnLogout');
  const modalLogout = document.getElementById('modalLogout');
  const btnConfirmarLogout = document.getElementById('btnConfirmarLogout');
  const btnCancelarLogout = document.getElementById('btnCancelarLogout');

  if (btnLogout && modalLogout) {
    const modalAvatar = document.getElementById('modalAvatar');
    const modalUserName = document.getElementById('modalUserName');
    const modalUserEmail = document.getElementById('modalUserEmail');
    btnLogout.addEventListener('click', function () {
      if (user) {
        if (modalAvatar) modalAvatar.textContent = initials || '?';
        if (modalUserName) modalUserName.textContent = (user.nombre || '') + ' ' + (user.apellido || '');
        if (modalUserEmail) modalUserEmail.textContent = user.email || '';
      }
      modalLogout.classList.add('open');
    });
  }
  if (btnCancelarLogout && modalLogout) {
    btnCancelarLogout.addEventListener('click', function () { modalLogout.classList.remove('open'); });
  }
  if (btnConfirmarLogout) {
    btnConfirmarLogout.addEventListener('click', function () {
      localStorage.removeItem('faunaUser');
      window.location.href = 'index.html';
    });
  }

  // --- Editar perfil ---
  const btnEditarPerfil = document.getElementById('btnEditarPerfil');
  const infoPersonalView = document.getElementById('infoPersonalView');
  const infoPersonalForm = document.getElementById('infoPersonalForm');
  const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');

  if (btnEditarPerfil && infoPersonalView && infoPersonalForm) {
    btnEditarPerfil.addEventListener('click', function () {
      if (user) {
        document.getElementById('editNombre').value = user.nombre || '';
        document.getElementById('editApellido').value = user.apellido || '';
        document.getElementById('editEmail').value = user.email || '';
      }
      infoPersonalView.style.display = 'none';
      infoPersonalForm.style.display = 'grid';
    });
  }
  if (btnCancelarEdicion && infoPersonalView && infoPersonalForm) {
    btnCancelarEdicion.addEventListener('click', function () {
      infoPersonalForm.style.display = 'none';
      infoPersonalView.style.display = 'grid';
    });
  }
  if (infoPersonalForm) {
    infoPersonalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const updated = Object.assign({}, user, {
        nombre: document.getElementById('editNombre').value.trim(),
        apellido: document.getElementById('editApellido').value.trim(),
        email: document.getElementById('editEmail').value.trim()
      });
      localStorage.setItem('faunaUser', JSON.stringify(updated));
      window.location.reload();
    });
  }
});
