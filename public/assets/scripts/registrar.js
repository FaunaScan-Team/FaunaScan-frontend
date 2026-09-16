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

  const especiesChips = document.getElementById('especiesChips');
  const especieError = document.getElementById('especieError');

  function guardarEspecieDesdeChip(chip) {
    localStorage.setItem('faunaEspecieRegistro', JSON.stringify({
      nombre: chip.dataset.nombre,
      cientifico: chip.dataset.cientifico,
      estado: chip.dataset.estado,
      emoji: chip.dataset.emoji
    }));
    if (especieError) especieError.style.display = 'none';
  }

  document.querySelectorAll('#especiesChips .chip').forEach(function (chip) {
    if (chip.id === 'chipOtraEspecie') return;
    chip.addEventListener('click', function () {
      document.querySelectorAll('#especiesChips .chip').forEach(function (c) { c.classList.remove('chip--active'); });
      chip.classList.add('chip--active');
      guardarEspecieDesdeChip(chip);
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

  // Si el usuario ya eligió una especie (chip por defecto o vía
  // seleccionar-especie.html), refleja esa selección al volver a esta
  // pantalla en vez de mostrar los chips sin ninguno activo.
  const especieGuardada = JSON.parse(localStorage.getItem('faunaEspecieRegistro') || 'null');
  if (especieGuardada && especiesChips) {
    document.querySelectorAll('#especiesChips .chip').forEach(function (c) { c.classList.remove('chip--active'); });
    const chipExistente = Array.from(especiesChips.querySelectorAll('.chip[data-nombre]')).find(function (c) {
      return c.dataset.nombre === especieGuardada.nombre;
    });
    if (chipExistente) {
      chipExistente.classList.add('chip--active');
    } else {
      const nuevoChip = document.createElement('button');
      nuevoChip.type = 'button';
      nuevoChip.className = 'chip chip--active';
      nuevoChip.textContent = especieGuardada.nombre;
      nuevoChip.dataset.nombre = especieGuardada.nombre;
      nuevoChip.dataset.cientifico = especieGuardada.cientifico || '';
      nuevoChip.dataset.estado = especieGuardada.estado || '';
      nuevoChip.dataset.emoji = especieGuardada.emoji || '';
      especiesChips.insertBefore(nuevoChip, document.getElementById('chipOtraEspecie'));
    }
  }

  const fotoGuardada = JSON.parse(localStorage.getItem('faunaFotoRegistro') || 'null');
  const uploadArea = document.getElementById('uploadArea');
  const fotoInput = document.getElementById('fotoInput');
  if (fotoGuardada && uploadArea) {
    uploadArea.innerHTML = `<img src="${fotoGuardada.src}" class="foto-preview-img"><p class="upload-area__text">${fotoGuardada.nombre}</p>`;
  }
  if (uploadArea && fotoInput) {
    uploadArea.addEventListener('click', function () { fotoInput.click(); });
    fotoInput.addEventListener('change', function () {
      if (!fotoInput.files || !fotoInput.files[0]) return;
      const file = fotoInput.files[0];
      const fotoURL = URL.createObjectURL(file);
      localStorage.setItem('faunaFotoRegistro', JSON.stringify({ nombre: file.name, src: fotoURL }));
      uploadArea.innerHTML = `<img src="${fotoURL}" class="foto-preview-img"><p class="upload-area__text">${file.name}</p>`;
    });
  }

  const obsGuardadas = JSON.parse(localStorage.getItem('faunaObservacionesRegistro') || 'null');
  const obsInlineInput = document.getElementById('obsInlineInput');
  if (obsGuardadas && obsInlineInput && obsGuardadas.descripcion) {
    obsInlineInput.value = obsGuardadas.descripcion;
  }

  const btnGeo = document.getElementById('btnGeolocate');
  const latInput = document.getElementById('latInput');
  const lngInput = document.getElementById('lngInput');
  if (btnGeo && latInput && lngInput) {
    btnGeo.addEventListener('click', function () {
      if (!navigator.geolocation) return;
      btnGeo.textContent = 'Obteniendo...';
      navigator.geolocation.getCurrentPosition(function (pos) {
        latInput.value = pos.coords.latitude.toFixed(6);
        lngInput.value = pos.coords.longitude.toFixed(6);
        btnGeo.textContent = '📍 Usar mi ubicación actual';
      }, function () {
        btnGeo.textContent = '📍 Usar mi ubicación actual';
      });
    });
  }

  const btnGuardar = document.getElementById('btnGuardar');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
      const especie = JSON.parse(localStorage.getItem('faunaEspecieRegistro') || 'null');
      if (!especie) {
        if (especieError) especieError.style.display = 'block';
        return;
      }

      btnGuardar.textContent = 'Guardando...';
      btnGuardar.disabled = true;

      const foto = JSON.parse(localStorage.getItem('faunaFotoRegistro') || 'null');
      const obsDetalladas = JSON.parse(localStorage.getItem('faunaObservacionesRegistro') || 'null');
      const user = JSON.parse(localStorage.getItem('faunaUser') || 'null');
      const fechaInput = document.getElementById('fechaAvistamiento');
      const areaInput = document.getElementById('areaInput');

      const avistamiento = {
        id: window.FaunaAvistamientos.generarId(),
        especie: especie,
        foto: foto,
        fecha: fechaInput && fechaInput.value ? fechaInput.value : new Date().toISOString(),
        area: areaInput ? areaInput.value.trim() : '',
        lat: latInput && latInput.value ? parseFloat(latInput.value) : null,
        lng: lngInput && lngInput.value ? parseFloat(lngInput.value) : null,
        observaciones: obsDetalladas || (obsInlineInput && obsInlineInput.value ? { descripcion: obsInlineInput.value } : null),
        estadoValidacion: 'Pendiente',
        favorito: false,
        registradoPor: user ? {
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol,
          credencialVerificada: user.credencialVerificada === true
        } : null,
        creadoEn: new Date().toISOString()
      };

      window.FaunaAvistamientos.add(avistamiento);

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
