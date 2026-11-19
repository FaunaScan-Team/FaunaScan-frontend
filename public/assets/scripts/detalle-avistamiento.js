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

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const registro = id && window.FaunaAvistamientos ? window.FaunaAvistamientos.getById(id) : null;

  const detalleLayout = document.getElementById('detalleLayout');
  const detalleNoEncontrado = document.getElementById('detalleNoEncontrado');

  if (!registro) {
    if (detalleLayout) detalleLayout.style.display = 'none';
    if (detalleNoEncontrado) detalleNoEncontrado.style.display = 'block';
    return;
  }

  const especie = registro.especie || {};
  const obs = registro.observaciones || {};

  function formatearFechaHora(valor) {
    if (!valor) return '—';
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return valor;
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' - ' + fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  document.getElementById('detalleNombre').textContent = especie.nombre || 'Especie no especificada';
  document.getElementById('detalleCientifico').textContent = especie.cientifico || '—';
  document.getElementById('detalleFoto').innerHTML = registro.foto && registro.foto.src
    ? `<img src="${registro.foto.src}" alt="${especie.nombre || ''}">`
    : `<span class="detalle-foto__placeholder">${especie.emoji || '🐾'}</span>`;
  document.getElementById('detalleBanner').querySelector('.detalle-banner__foto').textContent = especie.emoji || '🐾';
  document.getElementById('detalleZona').textContent = registro.area || 'Zona no especificada';
  document.getElementById('detalleEstadoEspecie').textContent = especie.estado || '—';
  document.getElementById('detalleEstadoValidacion').textContent = registro.estadoValidacion || 'Pendiente';
  document.getElementById('detalleLat').textContent = registro.lat != null ? registro.lat : '—';
  document.getElementById('detalleLng').textContent = registro.lng != null ? registro.lng : '—';
  document.getElementById('detalleObservacion').textContent = obs.descripcion || 'Sin observaciones registradas.';
  document.getElementById('detalleTemp').value = obs.temp || '—';
  document.getElementById('detalleHumedad').value = obs.humedad || '—';
  document.getElementById('detalleIndividuos').value = obs.individuos || '—';

  const detalleChips = document.getElementById('detalleChips');
  if (detalleChips) {
    detalleChips.innerHTML = '';
    if (obs.clima) {
      const chip = document.createElement('span');
      chip.className = 'detalle-chip';
      chip.textContent = obs.clima;
      detalleChips.appendChild(chip);
    }
  }

  // US47/US48: Editar/Eliminar solo si el avistamiento aún no fue validado.
  const btnEliminar = document.getElementById('btnEliminar');
  const btnEditar = document.getElementById('btnEditar');
  const yaValidado = registro.estadoValidacion === 'Validado';
  if (yaValidado) {
    [btnEliminar, btnEditar].forEach(function (btn) {
      if (!btn) return;
      btn.disabled = true;
      btn.title = 'Este avistamiento ya fue validado y no se puede modificar.';
    });
    const aviso = document.getElementById('detalleBloqueo');
    if (aviso) aviso.style.display = 'block';
  }

  // --- US56: compartir el avistamiento con colegas investigadores ---
  const usuario = window.FaunaAuth ? window.FaunaAuth.user : null;
  const btnCompartir = document.getElementById('btnCompartir');
  const modalCompartir = document.getElementById('modalCompartir');
  const colegasLista = document.getElementById('colegasLista');
  const compartirMensaje = document.getElementById('compartirMensaje');
  const compartirError = document.getElementById('compartirError');
  const detalleCompartidos = document.getElementById('detalleCompartidos');
  const compartidosLista = document.getElementById('compartidosLista');

  function formatearFechaCorta(valor) {
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return '—';
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  function iniciales(nombre) {
    return nombre
      .replace(/^(Dr\.|Dra\.)\s*/i, '')
      .split(' ')
      .slice(0, 2)
      .map(function (parte) { return parte.charAt(0).toUpperCase(); })
      .join('');
  }

  /** Historial de envíos de este avistamiento, debajo de las observaciones. */
  function pintarCompartidos() {
    if (!detalleCompartidos || !compartidosLista || !window.FaunaCompartidos) return;
    const envios = window.FaunaCompartidos.getByAvistamiento(registro.id);
    if (envios.length === 0) {
      detalleCompartidos.style.display = 'none';
      return;
    }
    compartidosLista.innerHTML = '';
    envios.forEach(function (envio) {
      envio.destinatarios.forEach(function (colega) {
        const item = document.createElement('li');
        item.className = 'compartidos-item';
        item.innerHTML =
          '<span class="compartidos-item__avatar">' + iniciales(colega.nombre) + '</span>' +
          '<span class="compartidos-item__info">' +
            '<span class="compartidos-item__nombre">' + colega.nombre + '</span>' +
            '<span class="compartidos-item__meta">' + colega.institucion + ' · ' + formatearFechaCorta(envio.fecha) + '</span>' +
          '</span>';
        compartidosLista.appendChild(item);
      });
    });
    detalleCompartidos.style.display = 'block';
  }

  /** Lista de colegas seleccionables dentro del modal. */
  function pintarColegas() {
    if (!colegasLista || !window.FaunaCompartidos) return;
    const especialidad = especie.familia || (usuario && usuario.especialidad) || '';
    colegasLista.innerHTML = '';
    window.FaunaCompartidos.colegas(especialidad).forEach(function (colega) {
      const item = document.createElement('li');
      item.className = 'colega-item';
      item.innerHTML =
        '<label class="colega-item__label">' +
          '<input type="checkbox" class="colega-item__check" value="' + colega.id + '">' +
          '<span class="colega-item__avatar">' + iniciales(colega.nombre) + '</span>' +
          '<span class="colega-item__info">' +
            '<span class="colega-item__nombre">' + colega.nombre + '</span>' +
            '<span class="colega-item__meta">' + colega.institucion + '</span>' +
          '</span>' +
        '</label>';
      colegasLista.appendChild(item);
    });
  }

  if (btnCompartir && modalCompartir) {
    btnCompartir.addEventListener('click', function () {
      pintarColegas();
      if (compartirMensaje) compartirMensaje.value = '';
      if (compartirError) compartirError.style.display = 'none';
      modalCompartir.classList.add('open');
    });

    document.getElementById('btnCancelarCompartir').addEventListener('click', function () {
      modalCompartir.classList.remove('open');
    });

    document.getElementById('btnConfirmarCompartir').addEventListener('click', function () {
      const seleccionados = Array.prototype.slice
        .call(colegasLista.querySelectorAll('.colega-item__check:checked'))
        .map(function (check) { return check.value; });

      if (seleccionados.length === 0) {
        if (compartirError) compartirError.style.display = 'block';
        return;
      }

      window.FaunaCompartidos.compartir(
        registro.id,
        seleccionados,
        compartirMensaje ? compartirMensaje.value : '',
        usuario
      );

      modalCompartir.classList.remove('open');
      pintarCompartidos();
    });
  }

  pintarCompartidos();

  const modal = document.getElementById('modalEliminar');
  const btnConfirmar = document.getElementById('btnConfirmarEliminar');
  const btnCancelar = document.getElementById('btnCancelarEliminar');

  if (btnEliminar && modal) {
    btnEliminar.addEventListener('click', function () {
      if (btnEliminar.disabled) return;
      modal.classList.add('open');
    });
  }
  if (btnCancelar && modal) {
    btnCancelar.addEventListener('click', function () { modal.classList.remove('open'); });
  }
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', function () {
      btnConfirmar.textContent = 'Eliminando';
      window.FaunaAvistamientos.remove(registro.id);
      setTimeout(function () { window.location.href = 'historial.html'; }, 600);
    });
  }

  const vistaNormal = document.getElementById('detalleVistaNormal');
  const vistaEdit = document.getElementById('detalleEditView');
  const btnCancelarEdicion = document.getElementById('btnCancelarEdicionDetalle');

  if (btnEditar && vistaNormal && vistaEdit) {
    btnEditar.addEventListener('click', function () {
      if (btnEditar.disabled) return;
      document.getElementById('editEspecieInput').value = especie.nombre || '';
      document.getElementById('editFechaInput').value = formatearFechaHora(registro.fecha);
      document.getElementById('editObsTextarea').value = obs.descripcion || '';
      vistaNormal.style.display = 'none';
      vistaEdit.style.display = 'block';
    });
  }
  if (btnCancelarEdicion && vistaNormal && vistaEdit) {
    btnCancelarEdicion.addEventListener('click', function () {
      vistaEdit.style.display = 'none';
      vistaNormal.style.display = 'block';
    });
  }
  if (vistaEdit) {
    vistaEdit.addEventListener('submit', function (e) {
      e.preventDefault();
      const nuevoNombre = document.getElementById('editEspecieInput').value.trim();
      const nuevaFecha = document.getElementById('editFechaInput').value.trim();
      const nuevaObs = document.getElementById('editObsTextarea').value;

      const cambios = {
        especie: Object.assign({}, especie, { nombre: nuevoNombre || especie.nombre }),
        fecha: nuevaFecha || registro.fecha,
        observaciones: Object.assign({}, obs, { descripcion: nuevaObs })
      };
      const actualizado = window.FaunaAvistamientos.update(registro.id, cambios);

      document.getElementById('detalleNombre').textContent = actualizado.especie.nombre;
      document.getElementById('detalleObservacion').textContent = actualizado.observaciones.descripcion || 'Sin observaciones registradas.';

      vistaEdit.style.display = 'none';
      vistaNormal.style.display = 'block';
    });
  }
});
