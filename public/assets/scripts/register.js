document.addEventListener('DOMContentLoaded', function () {

  function showError(input, msg) {
    clearError(input);
    input.style.borderColor = '#c0392b';
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

  document.querySelectorAll('.role-card').forEach(function (card) {
    card.addEventListener('click', function () {
      document.querySelectorAll('.role-card').forEach(function (c) { c.classList.remove('selected'); });
      card.classList.add('selected');
      var radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  var form = document.querySelector('#registerForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre   = form.querySelector('#regNombre');
    var apellido = form.querySelector('#regApellido');
    var email    = form.querySelector('#regEmail');
    var pass     = form.querySelector('#regPassword');
    var confirm  = form.querySelector('#regConfirm');
    var terms    = form.querySelector('#regTerms');
    var ok = true;

    [nombre, apellido, email, pass, confirm].forEach(clearError);

    if (!nombre.value.trim())           { showError(nombre,   'El nombre es obligatorio.');       ok = false; }
    if (!apellido.value.trim())         { showError(apellido, 'El apellido es obligatorio.');     ok = false; }
    if (!validEmail(email.value.trim())){ showError(email,    'Correo electrónico inválido.');    ok = false; }
    if (pass.value.length < 8)          { showError(pass,     'Mínimo 8 caracteres.');            ok = false; }
    if (confirm.value !== pass.value)   { showError(confirm,  'Las contraseñas no coinciden.');   ok = false; }
    if (terms && !terms.checked)        { ok = false; }

    if (ok) {
      var roleInput = form.querySelector('input[name="role"]:checked');
      var role = roleInput ? roleInput.value : 'voluntario';
      localStorage.setItem('faunaUser', JSON.stringify({
        nombre:   nombre.value.trim(),
        apellido: apellido.value.trim(),
        email:    email.value.trim(),
        rol:      role
      }));
      var btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Creando cuenta';
      btn.disabled = true;
      setTimeout(function () {
        window.location.href = role === 'investigador' ? 'verificacion-investigador.html' : 'dashboard.html';
      }, 1000);
    }
  });
});