document.addEventListener('DOMContentLoaded', function () {

  function showError(input, msg) {
    clearError(input);
    input.style.borderColor = '#991B1B';
    var err = document.createElement('span');
    err.style.cssText = 'font-size:0.8rem;color:#c0392b;margin-top:4px;display:block;';
    err.textContent = msg;
    input.parentElement.appendChild(err);
  }

  function clearError(input) {
    input.style.borderColor = '';
    var e = input.parentElement.querySelector('span');
    if (e && e.style.color === 'rgb(192, 57, 43)') e.remove();
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  var form = document.querySelector('#loginForm');
  if (!form) return;

  function showCredencialesInvalidas(pass) {
    // Criterio de aceptación US02: nunca revelar si el error fue el
    // correo o la contraseña — mismo mensaje genérico en ambos casos.
    showError(pass, 'Credenciales inválidas.');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.querySelector('#loginEmail');
    var pass = form.querySelector('#loginPassword');
    var ok = true;

    clearError(email); clearError(pass);
    if (!validEmail(email.value.trim())) { showError(email, 'Ingresa un correo válido.'); ok = false; }
    if (pass.value.length < 6) { showError(pass, 'Ingrese correctamente su contraseña.'); ok = false; }

    if (!ok) return;

    var btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Iniciando sesión';
    btn.disabled = true;

    var user = JSON.parse(localStorage.getItem('faunaUser') || 'null');

    FaunaCrypto.hashPassword(pass.value).then(function (enteredHash) {
      var credencialesValidas = user
        && user.email === email.value.trim()
        && user.passwordHash === enteredHash;

      if (!credencialesValidas) {
        btn.textContent = 'Iniciar sesión';
        btn.disabled = false;
        showCredencialesInvalidas(pass);
        return;
      }

      if (user.estado === 'INACTIVO') {
        btn.textContent = 'Iniciar sesión';
        btn.disabled = false;
        showError(pass, 'Cuenta inactiva. Contacta al administrador.');
        return;
      }

      var destino = 'dashboard.html';
      if (user.rol === 'investigador' && !user.credencialVerificada) {
        destino = 'verificacion-investigador.html';
      }
      setTimeout(function () { window.location.href = destino; }, 800);
    });
  });
});