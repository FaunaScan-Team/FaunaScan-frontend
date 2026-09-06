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

  var step2 = document.getElementById('recoveryStep2');
  var step3 = document.getElementById('recoveryStep3');
  var step4 = document.getElementById('recoveryStep4');

  function goToStep(n) {
    [step2, step3, step4].forEach(function (el) { if (el) el.style.display = 'none'; });
    if (n === 2 && step2) step2.style.display = 'block';
    if (n === 3 && step3) step3.style.display = 'block';
    if (n === 4 && step4) step4.style.display = 'block';

    document.querySelectorAll('#recoverySteps .recovery-step[data-step]').forEach(function (li) {
      var stepNum = parseInt(li.dataset.step, 10);
      var num = li.querySelector('.recovery-step__num');
      num.classList.remove('recovery-step__num--done', 'recovery-step__num--active', 'recovery-step__num--pending');
      if (stepNum < n) num.classList.add('recovery-step__num--done');
      else if (stepNum === n) num.classList.add('recovery-step__num--active');
      else num.classList.add('recovery-step__num--pending');
    });
  }

  var form = document.querySelector('#recoveryForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('#recoveryEmail');
      clearError(email);

      if (!validEmail(email.value.trim())) {
        showError(email, 'Ingresa un correo electrónico válido.');
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Enviando…';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = 'Enviar código de recuperación';
        btn.disabled = false;
        goToStep(3);
      }, 1200);
    });
  }

  var codeForm = document.querySelector('#codeForm');
  if (codeForm) {
    codeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = codeForm.querySelector('#recoveryCode');
      clearError(code);

      if (!code.value.trim()) {
        showError(code, 'Ingresa el código de verificación.');
        return;
      }

      var btn = codeForm.querySelector('button[type="submit"]');
      btn.textContent = 'Verificando';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = 'Enviar';
        btn.disabled = false;
        goToStep(4);
      }, 1200);
    });
  }

  var btnReenviar = document.getElementById('btnReenviarCodigo');
  if (btnReenviar) {
    btnReenviar.addEventListener('click', function () {
      btnReenviar.textContent = 'Código reenviado';
      setTimeout(function () { btnReenviar.textContent = 'Volver a enviar al correo'; }, 1800);
    });
  }
});
