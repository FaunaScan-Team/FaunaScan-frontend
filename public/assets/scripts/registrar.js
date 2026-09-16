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

  document.querySelectorAll('.chip').forEach(function (chip) {
    if (chip.id === 'chipOtraEspecie') return;
    chip.addEventListener('click', function () {
      chip.classList.toggle('chip--active');
    });
  });


  const iaToggle = document.getElementById('iaToggle');
  if (iaToggle) {
    const guardarEstadoIA = function () {
      const actual = JSON.parse(localStorage.getItem('faunaRegistroActual') || '{}');
      actual.iaActiva = iaToggle.checked;
      localStorage.setItem('faunaRegistroActual', JSON.stringify(actual));
    };
    guardarEstadoIA();
    iaToggle.addEventListener('change', guardarEstadoIA);
  }


  const especieGuardada = JSON.parse(localStorage.getItem('faunaEspecieRegistro') || 'null');
  if (especieGuardada) {
    document.querySelectorAll('#especiesChips .chip').forEach(function (c) { c.classList.remove('chip--active'); });
    const especiesChips = document.getElementById('especiesChips');
    if (especiesChips) {
      const nuevoChip = document.createElement('button');
      nuevoChip.className = 'chip chip--active';
      nuevoChip.type = 'button';
      nuevoChip.textContent = especieGuardada.nombre;
      especiesChips.insertBefore(nuevoChip, document.getElementById('chipOtraEspecie'));
    }
  }


  const fotoGuardada = JSON.parse(localStorage.getItem('faunaFotoRegistro') || 'null');
  const uploadArea = document.getElementById('uploadArea');
  if (fotoGuardada && uploadArea) {
    uploadArea.innerHTML = `<img src="${fotoGuardada.src}" class="foto-preview-img"><p class="upload-area__text">${fotoGuardada.nombre}</p>`;
  }


  const obsGuardadas = JSON.parse(localStorage.getItem('faunaObservacionesRegistro') || 'null');
  if (obsGuardadas) {
    const textarea = document.querySelector('.registrar-right textarea.form-input');
    if (textarea && obsGuardadas.descripcion) textarea.value = obsGuardadas.descripcion;
  }

  const btnGeo = document.getElementById('btnGeolocate');
  const latInput = document.getElementById('latitud');
  const lngInput = document.getElementById('longitud');
  if (btnGeo && latInput && lngInput) {
    btnGeo.addEventListener('click', function () {
      if (!navigator.geolocation) return;
      btnGeo.textContent = 'Obteniendo...';
      navigator.geolocation.getCurrentPosition(function (pos) {
        latInput.value = pos.coords.latitude.toFixed(6);
        lngInput.value = pos.coords.longitude.toFixed(6);
        btnGeo.textContent = '📍 Usar mi ubicación';
      }, function () {
        btnGeo.textContent = '📍 Usar mi ubicación';
      });
    });
  }

  const btnGuardar = document.getElementById('btnGuardar');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
      btnGuardar.textContent = 'Guardando...';
      btnGuardar.disabled = true;
      const banner = document.createElement('div');
      banner.className = 'registro-exito-banner';
      banner.textContent = '¡Avistamiento guardado correctamente! Se almacenó localmente y se sincronizará al recuperar la conexión.';
      const layout = document.querySelector('.registrar-layout');
      if (layout) layout.parentNode.insertBefore(banner, layout);
      ['faunaEspecieRegistro', 'faunaFotoRegistro', 'faunaObservacionesRegistro', 'faunaRegistroActual'].forEach(function (k) {
        localStorage.removeItem(k);
      });
      setTimeout(function () {
        window.location.href = 'historial.html';
      }, 900);
    });
  }
});
