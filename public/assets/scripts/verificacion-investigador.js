document.addEventListener('DOMContentLoaded', function () {
  const uploadBox = document.getElementById('uploadBox');
  const input = document.getElementById('credencialInput');
  const credencialInfo = document.getElementById('credencialInfo');
  const credencialNombre = document.getElementById('credencialNombre');
  const checkList = document.getElementById('checkList');
  const btnContinuar = document.getElementById('btnContinuar');
  const btnNueva = document.getElementById('btnNuevaCredencial');
  const uploadError = document.getElementById('uploadError');

  const FORMATOS_ACEPTADOS = ['application/pdf', 'image/jpeg', 'image/png'];
  const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

  function mostrarError(mensaje) {
    if (!uploadError) return;
    uploadError.textContent = mensaje;
    uploadError.style.display = 'block';
    uploadBox && uploadBox.classList.add('upload-box--error');
  }

  function limpiarError() {
    if (!uploadError) return;
    uploadError.textContent = '';
    uploadError.style.display = 'none';
    uploadBox && uploadBox.classList.remove('upload-box--error');
  }

  if (uploadBox && input) {
    uploadBox.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      if (!input.files || !input.files[0]) return;
      const archivo = input.files[0];

      if (!FORMATOS_ACEPTADOS.includes(archivo.type)) {
        mostrarError('Formato no soportado. Sube un archivo PDF, JPG o PNG.');
        input.value = '';
        return;
      }
      if (archivo.size > TAMANO_MAXIMO_BYTES) {
        mostrarError('El archivo supera el tamaño máximo permitido de 5MB.');
        input.value = '';
        return;
      }

      limpiarError();
      credencialNombre.textContent = archivo.name;
      credencialInfo.style.display = 'block';
      checkList.style.display = 'block';
      uploadBox.style.display = 'none';
      btnContinuar.disabled = false;
    });
  }

  if (btnNueva) {
    btnNueva.addEventListener('click', function () {
      credencialInfo.style.display = 'none';
      checkList.style.display = 'none';
      uploadBox.style.display = 'flex';
      btnContinuar.disabled = true;
      input.value = '';
      limpiarError();
    });
  }

  if (btnContinuar) {
    btnContinuar.addEventListener('click', function () {
      if (btnContinuar.disabled) return;
      const user = JSON.parse(localStorage.getItem('faunaUser') || 'null');
      if (user) {
        user.rol = 'investigador';
        user.credencialVerificada = true;
        localStorage.setItem('faunaUser', JSON.stringify(user));
      }
      btnContinuar.textContent = 'Verificando';
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 700);
    });
  }

  const btnCerrarSesion = document.getElementById('btnCerrarSesionVerificacion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function () {
      localStorage.removeItem('faunaUser');
      window.location.href = 'login.html';
    });
  }
});
