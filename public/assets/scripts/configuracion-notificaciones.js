/**
 * configuracion-notificaciones.js
 * FaunaScan Perú — Preferencias de notificaciones.
 *
 * Antes: el botón "Guardar" solo cambiaba su propio texto a "Guardado"
 * por 1.5s con setTimeout, sin escribir nada en ningún lado -- al
 * recargar la página los toggles siempre volvían al valor hardcodeado
 * "checked" del HTML, sin importar lo que el usuario hubiera elegido.
 *
 * Ahora el estado se persiste en localStorage bajo "faunaNotifPrefs"
 * (un objeto { categoria: boolean }) y se carga al abrir la página, así
 * que el toggle sobrevive a un reload real. notificaciones.js lee esta
 * misma clave para decidir qué notificaciones generar (vulnerables y
 * validacion son las únicas categorías con datos reales por ahora).
 */
document.addEventListener('DOMContentLoaded', function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar__link').forEach(function (link) {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

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

  const PREFS_KEY = 'faunaNotifPrefs';

  function cargarPrefs() {
    try {
      return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function actualizarVistaPrevia(categoria, activa) {
    const previewItem = document.querySelector('.vista-previa__item[data-category="' + categoria + '"]');
    if (previewItem) previewItem.classList.toggle('vista-previa__item--off', !activa);
  }

  const prefs = cargarPrefs();
  const filas = document.querySelectorAll('.notifcat-row');

  filas.forEach(function (row) {
    const categoria = row.dataset.category;
    const chk = row.querySelector('input[type="checkbox"]');
    const activa = prefs[categoria] !== false; // por defecto activa si nunca se guardó
    chk.checked = activa;
    actualizarVistaPrevia(categoria, activa);

    chk.addEventListener('change', function () {
      actualizarVistaPrevia(categoria, chk.checked);
    });
  });

  const btnGuardar = document.getElementById('btnGuardarNotif');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
      const nuevasPrefs = {};
      filas.forEach(function (row) {
        const categoria = row.dataset.category;
        const chk = row.querySelector('input[type="checkbox"]');
        nuevasPrefs[categoria] = chk.checked;
      });
      localStorage.setItem(PREFS_KEY, JSON.stringify(nuevasPrefs));
      btnGuardar.textContent = 'Guardado';
      setTimeout(function () { btnGuardar.textContent = 'Guardar'; }, 1500);
    });
  }
});
