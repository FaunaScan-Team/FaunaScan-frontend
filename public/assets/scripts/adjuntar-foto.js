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

  const dropzone = document.getElementById('dropzone');
  const input = document.getElementById('fotoGaleriaInput');
  const btnGaleria = document.getElementById('btnGaleria');
  const btnNube = document.getElementById('btnNube');
  const btnAsociar = document.getElementById('btnAsociar');
  const previewImg = document.getElementById('previewImg');
  const metaArchivo = document.getElementById('metaArchivo');
  const metaTamano = document.getElementById('metaTamano');
  const metaResolucion = document.getElementById('metaResolucion');
  const metaEstado = document.getElementById('metaEstado');

  let fotoSeleccionada = null;

  function seleccionarFoto(nombre, emoji, src) {
    fotoSeleccionada = { nombre: nombre, emoji: emoji, src };
     if (src) {
    previewImg.innerHTML = `<img src="${src}" alt="${nombre}">`;
    } else {
    previewImg.textContent = emoji;
    }

    metaArchivo.textContent = nombre;
    metaTamano.textContent = (1.2 + Math.random()).toFixed(1) + ' MB';
    metaResolucion.textContent = '4032 x 3024 px';
    metaEstado.textContent = 'Lista para procesar';
    btnAsociar.disabled = false;
    document.querySelectorAll('.foto-reciente').forEach(function (b) { b.classList.remove('selected'); });
  }

  if (dropzone && input) {
    dropzone.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileURL = URL.createObjectURL(file);

        seleccionarFoto(file.name, '📷', fileURL);
    }
  });
  }
  if (btnGaleria && input) {
    btnGaleria.addEventListener('click', function () { input.click(); });
  }
  if (btnNube) {
    btnNube.addEventListener('click', function () {
      btnNube.textContent = 'Conectando…';
      setTimeout(function () {
        btnNube.textContent = 'Nube';
        seleccionarFoto('foto_nube_' + Date.now() + '.jpg', '☁️', '');
      }, 900);
    });
  }

  document.querySelectorAll('.foto-reciente').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.foto-reciente').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      const img = btn.querySelector('img');
      seleccionarFoto(btn.dataset.nombre, btn.dataset.emoji, img.src);
    });
  });

  if (btnAsociar) {
    btnAsociar.addEventListener('click', function () {
      if (btnAsociar.disabled || !fotoSeleccionada) return;
      localStorage.setItem('faunaFotoRegistro', JSON.stringify(fotoSeleccionada));
      btnAsociar.textContent = 'Asociando';
      const registro = JSON.parse(localStorage.getItem('faunaRegistroActual') || '{}');
      setTimeout(function () {
        if (registro.iaActiva) {
          window.location.href = 'identificar-ia.html';
        } else {
          window.location.href = 'registrar.html';
        }
      }, 500);
    });
  }
});
