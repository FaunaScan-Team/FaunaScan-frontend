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

  const input = document.getElementById('buscarEspecieInput');
  const termino = document.getElementById('buscarTermino');
  const items = document.querySelectorAll('.resultado-item');
  const btnConfirmar = document.getElementById('btnConfirmarEspecieManual');
  let seleccionActual = null;

  if (input) {
    input.addEventListener('input', function () {
      const valor = input.value.trim();
      if (termino) termino.textContent = valor;
      items.forEach(function (item) {
        const match = item.dataset.nombre.toLowerCase().includes(valor.toLowerCase());
        item.style.display = (valor === '' || match) ? 'flex' : 'none';
      });
    });
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      items.forEach(function (i) { i.classList.remove('selected'); });
      item.classList.add('selected');
      seleccionActual = {
        nombre: item.dataset.nombre,
        cientifico: item.dataset.cientifico,
        estado: item.dataset.estado,
        emoji: item.dataset.emoji
      };
      btnConfirmar.disabled = false;
    });
  });

  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', function () {
      if (btnConfirmar.disabled || !seleccionActual) return;
      localStorage.setItem('faunaEspecieRegistro', JSON.stringify(seleccionActual));
      btnConfirmar.textContent = 'Confirmando';
      setTimeout(function () { window.location.href = 'registrar.html'; }, 400);
    });
  }
});
