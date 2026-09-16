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

  const foto = JSON.parse(localStorage.getItem('faunaFotoRegistro') || 'null');
  if (foto && foto.src) {
      document.getElementById('identificarFoto').src = foto.src;
  }

  let especieActual = { nombre: 'Oso de Anteojos', cientifico: 'Tremarctos ornatus' };

  document.querySelectorAll('.alternativa-card').forEach(function (card) {
    card.addEventListener('click', function () {
      especieActual = { nombre: card.dataset.nombre, cientifico: card.dataset.cientifico };
      document.getElementById('resPrincipalNombre').textContent = especieActual.nombre;
      document.getElementById('resPrincipalCientifico').textContent = especieActual.cientifico;
    });
  });

  const btnConfirmar = document.getElementById('btnConfirmarEspecie');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', function () {
      localStorage.setItem('faunaEspecieRegistro', JSON.stringify(especieActual));
      btnConfirmar.textContent = 'Confirmando';
      setTimeout(function () { window.location.href = 'registrar.html'; }, 400);
    });
  }

  const btnCambiar = document.getElementById('btnCambiarEspecie');
  if (btnCambiar) {
    btnCambiar.addEventListener('click', function () {
      window.location.href = 'seleccionar-especie.html';
    });
  }
});
