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
  const btnAsociar = document.getElementById('btnAsociar');
  const previewImg = document.getElementById('previewImg');
  const metaArchivo = document.getElementById('metaArchivo');
  const metaTamano = document.getElementById('metaTamano');
  const metaResolucion = document.getElementById('metaResolucion');
  const metaEstado = document.getElementById('metaEstado');

  let fotoSeleccionada = null;

  function formatearBytes(bytes) {
    if (!bytes && bytes !== 0) return '—';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Muestra tamaño y resolución REALES de la imagen (antes eran datos
  // inventados: un tamaño aleatorio y una resolución fija "4032x3024"
  // sin relación con el archivo elegido).
  function mostrarMetadatosReales(nombre, src, bytesConocidos) {
    metaArchivo.textContent = nombre;
    metaTamano.textContent = 'Calculando…';
    metaResolucion.textContent = 'Calculando…';

    const img = new Image();
    img.onload = function () {
      metaResolucion.textContent = img.naturalWidth + ' x ' + img.naturalHeight + ' px';
    };
    img.onerror = function () {
      metaResolucion.textContent = '—';
    };
    img.src = src;

    if (bytesConocidos != null) {
      metaTamano.textContent = formatearBytes(bytesConocidos);
    } else {
      fetch(src).then(function (r) { return r.blob(); }).then(function (blob) {
        metaTamano.textContent = formatearBytes(blob.size);
      }).catch(function () {
        metaTamano.textContent = '—';
      });
    }
  }

  function seleccionarFoto(nombre, src, bytesConocidos) {
    fotoSeleccionada = { nombre: nombre, src: src };
    previewImg.innerHTML = `<img src="${src}" alt="${nombre}">`;
    mostrarMetadatosReales(nombre, src, bytesConocidos);
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
        seleccionarFoto(file.name, fileURL, file.size);
      }
    });
  }
  if (btnGaleria && input) {
    btnGaleria.addEventListener('click', function () { input.click(); });
  }

  document.querySelectorAll('.foto-reciente').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.foto-reciente').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      const img = btn.querySelector('img');
      seleccionarFoto(btn.dataset.nombre, img.src, null);
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
