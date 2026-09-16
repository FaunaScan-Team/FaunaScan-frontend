document.addEventListener('DOMContentLoaded', function () {
  const uploadBox = document.getElementById('uploadBox');
  const input = document.getElementById('credencialInput');
  const credencialInfo = document.getElementById('credencialInfo');
  const credencialNombre = document.getElementById('credencialNombre');
  const checkList = document.getElementById('checkList');
  const btnContinuar = document.getElementById('btnContinuar');
  const btnNueva = document.getElementById('btnNuevaCredencial');

  if (uploadBox && input) {
    uploadBox.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      if (!input.files || !input.files[0]) return;
      credencialNombre.textContent = input.files[0].name;
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
});
