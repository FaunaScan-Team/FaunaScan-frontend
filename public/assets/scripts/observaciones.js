document.addEventListener('DOMContentLoaded', function () {
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

  const especie = JSON.parse(localStorage.getItem('faunaEspecieRegistro') || 'null');
  if (especie) document.getElementById('resEspecie').textContent = especie.nombre;

  let climaSeleccionado = null;
  document.querySelectorAll('.clima-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.clima-btn').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      climaSeleccionado = btn.dataset.clima;
      actualizarResumenClima();
    });
  });

  const obsTemp = document.getElementById('obsTemp');
  const obsHumedad = document.getElementById('obsHumedad');
  const obsIndividuos = document.getElementById('obsIndividuos');

  function actualizarResumenClima() {
    const resumenClima = document.getElementById('resumenClima');
    if (!climaSeleccionado) { resumenClima.style.display = 'none'; return; }
    const iconos = { 'Soleado': '☀️', 'Parcial nublado': '🌤️', 'Lluvioso': '🌧️', 'Nublado': '☁️', 'Ventoso': '🌬️', 'Tormenta': '⛈️', 'Frío intenso': '❄️', 'Caluroso': '🌡️' };
    document.getElementById('resumenClimaIcon').textContent = iconos[climaSeleccionado] || '☀️';
    document.getElementById('resumenClimaNombre').textContent = climaSeleccionado + (obsTemp.value ? ' · ' + obsTemp.value + '°C' : '');
    const now = new Date();
    const hora = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    document.getElementById('resumenClimaSub').textContent = 'Humedad ' + (obsHumedad.value || '—') + '% · Hora ' + hora;
    resumenClima.style.display = 'flex';
  }

  [obsTemp, obsHumedad].forEach(function (el) { el.addEventListener('input', actualizarResumenClima); });
  if (obsIndividuos) {
    obsIndividuos.addEventListener('input', function () {
      document.getElementById('resIndividuos').textContent = obsIndividuos.value || '-';
    });
  }

  const descripcion = document.getElementById('obsDescripcion');
  const charCount = document.getElementById('charCount');
  if (descripcion && charCount) {
    descripcion.addEventListener('input', function () {
      charCount.textContent = descripcion.value.length;
      document.getElementById('resObservaciones').textContent = descripcion.value ? 'Completadas' : '-';
    });
  }

  const tagInput = document.getElementById('tagInput');
  const tagsBox = document.getElementById('tagsBox');
  if (tagInput) {
    tagInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && tagInput.value.trim()) {
        e.preventDefault();
        const chip = document.createElement('span');
        chip.className = 'tag-chip';
        chip.innerHTML = tagInput.value.trim() + ' <button type="button">×</button>';
        chip.querySelector('button').addEventListener('click', function () { chip.remove(); });
        tagsBox.insertBefore(chip, tagInput);
        tagInput.value = '';
      }
    });
  }

  const btnGuardar = document.getElementById('btnGuardarObs');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
      const obs = {
        clima: climaSeleccionado,
        temp: obsTemp.value,
        humedad: obsHumedad.value,
        individuos: obsIndividuos.value,
        descripcion: descripcion.value
      };
      localStorage.setItem('faunaObservacionesRegistro', JSON.stringify(obs));
      btnGuardar.textContent = 'Guardando';
      setTimeout(function () { window.location.href = 'registrar.html'; }, 500);
    });
  }

  document.getElementById('resFecha').textContent = new Date().toLocaleDateString('es-PE');
});
