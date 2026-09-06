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
  const registro = JSON.parse(localStorage.getItem('faunaRegistroDetalle') || 'null');
  if (registro) {
    document.getElementById('detalleNombre').textContent = registro.nombre || 'Oso de Anteojos';
    document.getElementById('detalleCientifico').textContent = registro.cientifico || 'Tremarctos ornatus';
    document.getElementById("detalleFoto").innerHTML = `<img src="${registro.imagen || 'assets/images/OsoDeAnteojosDetalle.png'}">`;    
    document.getElementById('detalleBanner').querySelector('.detalle-banner__foto').textContent = registro.emoji || '🐻';
    document.getElementById('detalleZona').textContent = registro.zona || 'Bosque El Olivar';
    document.getElementById('detalleEstadoValidacion').textContent = registro.estado || 'No Validado';
  } else if (params.get('especie')) {
    document.getElementById('detalleNombre').textContent = params.get('especie');
    document.getElementById('detalleZona').textContent = params.get('zona') || 'Bosque El Olivar';
  }

  const btnEliminar = document.getElementById('btnEliminar');
  const modal = document.getElementById('modalEliminar');
  const btnConfirmar = document.getElementById('btnConfirmarEliminar');
  const btnCancelar = document.getElementById('btnCancelarEliminar');

  if (btnEliminar && modal) {
    btnEliminar.addEventListener('click', function () { modal.classList.add('open'); });
  }
  if (btnCancelar && modal) {
    btnCancelar.addEventListener('click', function () { modal.classList.remove('open'); });
  }
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', function () {
      btnConfirmar.textContent = 'Eliminando';
      setTimeout(function () { window.location.href = 'historial.html'; }, 600);
    });
  }

  const btnEditar = document.getElementById('btnEditar');
  const vistaNormal = document.getElementById('detalleVistaNormal');
  const vistaEdit = document.getElementById('detalleEditView');
  const btnCancelarEdicion = document.getElementById('btnCancelarEdicionDetalle');

  if (btnEditar && vistaNormal && vistaEdit) {
    btnEditar.addEventListener('click', function () {
      document.getElementById('editEspecieInput').value = document.getElementById('detalleNombre').textContent;
      document.getElementById('editObsTextarea').value = document.getElementById('detalleObservacion').textContent;
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
      document.getElementById('detalleNombre').textContent = document.getElementById('editEspecieInput').value;
      document.getElementById('detalleObservacion').textContent = document.getElementById('editObsTextarea').value;
      vistaEdit.style.display = 'none';
      vistaNormal.style.display = 'block';
    });
  }
});
