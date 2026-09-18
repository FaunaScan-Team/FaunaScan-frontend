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
    const esInvestigador = user.rol === 'investigador';
    const credencialVerificada = esInvestigador && user.credencialVerificada === true;

    const avatar = document.getElementById('perfilAvatar');
    const nameEl = document.getElementById('perfilName');
    const emailEl = document.getElementById('perfilEmail');
    const roleEl = document.getElementById('perfilRole');
    if (avatar) avatar.textContent = initials || '?';
    if (nameEl) nameEl.textContent = (user.nombre || '') + ' ' + (user.apellido || '');
    if (emailEl) emailEl.textContent = user.email || '';
    if (roleEl) {
      roleEl.textContent = esInvestigador ? 'Investigador' : 'Voluntario';
      roleEl.classList.remove('badge-blue', 'badge-yellow');
      roleEl.classList.add(esInvestigador ? 'badge-blue' : 'badge-yellow');
    }

    const fullNameEl = document.getElementById('perfilFullName');
    const emailInfoEl = document.getElementById('perfilEmailInfo');
    const roleInfoEl = document.getElementById('perfilRoleInfo');
    if (fullNameEl) fullNameEl.textContent = (user.nombre || '') + ' ' + (user.apellido || '');
    if (emailInfoEl) emailInfoEl.textContent = user.email || '';
    if (roleInfoEl) {
      if (esInvestigador) {
        roleInfoEl.textContent = credencialVerificada ? 'Investigador verificado' : 'Investigador (verificación pendiente)';
      } else {
        roleInfoEl.textContent = 'Voluntario';
      }
    }

    // --- Verificación de investigador (solo aplica a rol investigador) ---
    const cardVerificacion = document.getElementById('cardVerificacion');
    const verificacionVerificada = document.getElementById('verificacionVerificada');
    const verificacionPendiente = document.getElementById('verificacionPendiente');
    if (esInvestigador && cardVerificacion) {
      cardVerificacion.style.display = 'block';
      if (credencialVerificada) {
        verificacionVerificada.style.display = 'block';
        verificacionPendiente.style.display = 'none';
      } else {
        verificacionVerificada.style.display = 'none';
        verificacionPendiente.style.display = 'block';
      }
    }

    // --- Estadísticas y logros reales del usuario autenticado ---
    // Antes eran números fijos en el HTML ("142 / 38 / 7") e insignias
    // fijas ("100 registros", "5 zonas", "IA explorador", "14 días
    // seguidos") iguales para cualquier cuenta.
    const U = window.FaunaReportesUtils;
    const mios = window.FaunaAvistamientos
      ? window.FaunaAvistamientos.getAll().filter(function (a) {
          return a.registradoPor && a.registradoPor.email === user.email;
        })
      : [];
    const zonas = U.zonasUnicas(mios).size;

    document.getElementById('statAvistamientos').textContent = mios.length;
    document.getElementById('statEspecies').textContent = U.especiesUnicas(mios).size;
    document.getElementById('statZonas').textContent = zonas;

    // Mismos umbrales que usa el panel principal, para que las insignias
    // no se contradigan entre pantallas.
    function umbralAlcanzado(total, umbrales) {
      let alcanzado = null;
      umbrales.forEach(function (u) { if (total >= u) alcanzado = u; });
      return alcanzado;
    }
    const umbralRegistros = umbralAlcanzado(mios.length, [5, 10, 25, 50, 100]);
    const umbralZonas = umbralAlcanzado(zonas, [3, 5, 10, 20]);

    const listaLogros = document.getElementById('achievementsList');
    const logros = [esInvestigador ? 'investigador' : 'voluntario'];
    if (umbralRegistros) logros.push(umbralRegistros + '+ avistamientos');
    if (umbralZonas) logros.push(umbralZonas + '+ zonas');
    logros.forEach(function (texto) {
      const tag = document.createElement('span');
      tag.className = 'badge badge-green';
      tag.textContent = texto;
      listaLogros.appendChild(tag);
    });
    if (!umbralRegistros && !umbralZonas) {
      document.getElementById('achievementsEmpty').style.display = 'block';
    }

    // --- Miembro desde: fecha real de creación de la cuenta ---
    const miembroDesde = document.getElementById('perfilMiembroDesde');
    if (miembroDesde) {
      const creada = user.creadoEn ? new Date(user.creadoEn) : null;
      miembroDesde.textContent = creada && !isNaN(creada.getTime())
        ? creada.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
        : 'No disponible';
    }

    // --- Especialidad taxonómica (US61, solo investigador) ---
    const grupoEspecialidad = document.getElementById('grupoEspecialidad');
    if (grupoEspecialidad) grupoEspecialidad.style.display = esInvestigador ? 'flex' : 'none';
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
        document.getElementById('editTelefono').value = user.telefono || '';
        document.getElementById('editInstitucion').value = user.institucion || '';
        document.getElementById('editBio').value = user.bio || '';
        const especialidadInput = document.getElementById('editEspecialidad');
        if (especialidadInput) especialidadInput.value = user.especialidad || '';
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
      const especialidadInput = document.getElementById('editEspecialidad');
      const updated = Object.assign({}, user, {
        nombre: document.getElementById('editNombre').value.trim(),
        apellido: document.getElementById('editApellido').value.trim(),
        telefono: document.getElementById('editTelefono').value.trim(),
        institucion: document.getElementById('editInstitucion').value.trim(),
        bio: document.getElementById('editBio').value.trim(),
        especialidad: especialidadInput ? especialidadInput.value : ''
      });
      localStorage.setItem('faunaUser', JSON.stringify(updated));
      window.location.reload();
    });
  }
});
