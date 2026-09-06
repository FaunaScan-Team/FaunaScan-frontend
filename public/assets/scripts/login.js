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

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.querySelector('#loginEmail');
    var pass = form.querySelector('#loginPassword');
    var ok = true;

    clearError(email); clearError(pass);
    if (!validEmail(email.value.trim())) { showError(email, 'Ingresa un correo válido.'); ok = false; }
    if (pass.value.length < 6) { showError(pass, 'Ingrese correctamente su contraseña.'); ok = false; }

    if (ok) {
      var user = JSON.parse(localStorage.getItem('faunaUser') || 'null');
      if (!user || user.email !== email.value.trim()) {
        showError(email, 'No tienes cuenta con ese correo. Regístrate primero.');
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Iniciando sesión';
      btn.disabled = true;
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 1000);
    }
  });
});