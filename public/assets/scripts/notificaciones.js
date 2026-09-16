/**
 * notificaciones.js
 * FaunaScan Perú — Lista de notificaciones (US11/US12/US13).
 *
 * Antes: 6 notificaciones fijas en el HTML, sin relación con ningún dato
 * real -- incluyendo una que afirmaba textualmente "El modelo de
 * identificación fue actualizado a v2.4. Precisión mejorada al 96.1%",
 * la misma clase de afirmación inventada que ya se retiró de
 * sistema.html (no existe tal modelo ni tal métrica en el código).
 *
 * Ahora las notificaciones se generan a partir de datos reales en
 * FaunaAvistamientos:
 * - "Crítica": avistamientos de la comunidad cuya especie está en
 *   estado de peligro (real, calculado igual que en Mapa/Tendencias).
 * - "Alerta": avistamientos PROPIOS que ya fueron validados.
 * - "Sistema": no hay ningún evento de sistema real que generar todavía
 *   (no existe actualización de modelo de IA, sincronización offline
 *   real, ni mantenimiento programado) -- la categoría se deja vacía en
 *   vez de inventar contenido, respetando la misma regla que ya se
 *   aplicó al eliminar sistema.html.
 *
 * Respeta las preferencias guardadas en configuracion-notificaciones.html
 * (localStorage "faunaNotifPrefs"): si el usuario apagó "Alertas de
 * especies vulnerables" o "Validación de mis registros", esas
 * notificaciones no se generan.
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

  function tiempoRelativo(iso) {
    const f = new Date(iso);
    if (isNaN(f.getTime())) return '—';
    const minutos = Math.round((Date.now() - f.getTime()) / 60000);
    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return 'Hace ' + minutos + ' min';
    const horas = Math.round(minutos / 60);
    if (horas < 24) return 'Hace ' + horas + (horas === 1 ? ' hora' : ' horas');
    const dias = Math.round(horas / 24);
    return 'Hace ' + dias + (dias === 1 ? ' día' : ' días');
  }

  const usuario = JSON.parse(localStorage.getItem('faunaUser') || 'null');
  const prefs = JSON.parse(localStorage.getItem('faunaNotifPrefs') || '{}');
  const prefActiva = function (clave) { return prefs[clave] !== false; }; // por defecto activas

  const todos = window.FaunaAvistamientos ? window.FaunaAvistamientos.getAll() : [];
  const notifs = [];

  if (prefActiva('vulnerables')) {
    todos.forEach(function (a) {
      const especie = a.especie || {};
      if (especie.estado && especie.estado.toUpperCase().indexOf('PELIGRO') !== -1) {
        notifs.push({
          categoria: 'criticas',
          icono: '🚨',
          titulo: 'Avistamiento crítico — ' + (especie.nombre || 'Especie no especificada'),
          desc: 'Se registró un avistamiento en ' + (a.area || 'zona no especificada') + '. Estado de la especie: ' + especie.estado + '.',
          fecha: a.fecha,
          meta: (a.area || '—')
        });
      }
    });
  }

  if (usuario && prefActiva('validacion')) {
    todos.forEach(function (a) {
      if (a.estadoValidacion === 'Validado' && a.registradoPor && a.registradoPor.email === usuario.email) {
        const especie = a.especie || {};
        notifs.push({
          categoria: 'alertas',
          icono: '✅',
          titulo: 'Tu registro fue validado',
          desc: 'El avistamiento de ' + (especie.nombre || 'especie no especificada') + ' que registraste fue validado.',
          fecha: a.fecha,
          meta: a.area || '—'
        });
      }
    });
  }

  notifs.sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });

  const CATEGORIA_INFO = {
    criticas: { clase: 'notif-item--red', badge: 'badge-red', badgeTexto: 'Crítica' },
    sistema: { clase: 'notif-item--blue', badge: 'badge-blue', badgeTexto: 'Sistema' },
    alertas: { clase: 'notif-item--yellow', badge: 'badge-yellow', badgeTexto: 'Alerta' }
  };

  const list = document.getElementById('notifList');
  const vacio = document.getElementById('notifEmpty');

  if (notifs.length === 0) {
    vacio.style.display = 'block';
  } else {
    notifs.forEach(function (n) {
      const info = CATEGORIA_INFO[n.categoria];
      const item = document.createElement('div');
      item.className = 'notif-item ' + info.clase;
      item.dataset.category = n.categoria;
      item.innerHTML =
        '<div class="notif-item__left">' +
          '<span class="notif-item__icon">' + n.icono + '</span>' +
          '<div>' +
            '<p class="notif-item__title">' + n.titulo + '</p>' +
            '<p class="notif-item__desc">' + n.desc + '</p>' +
            '<p class="notif-item__meta">' + tiempoRelativo(n.fecha) + ' · ' + n.meta + '</p>' +
          '</div>' +
        '</div>' +
        '<span class="badge ' + info.badge + '">' + info.badgeTexto + '</span>';
      list.appendChild(item);
    });
  }

  document.getElementById('countCriticas').textContent = notifs.filter(function (n) { return n.categoria === 'criticas'; }).length;
  document.getElementById('countSistema').textContent = notifs.filter(function (n) { return n.categoria === 'sistema'; }).length;
  document.getElementById('countAlertas').textContent = notifs.filter(function (n) { return n.categoria === 'alertas'; }).length;

  const filterBtns = document.querySelectorAll('.notif-filter');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('notif-filter--active'); });
      btn.classList.add('notif-filter--active');
      const cat = btn.dataset.filter || 'todas';
      const items = document.querySelectorAll('.notif-item');
      let visibles = 0;
      items.forEach(function (item) {
        const visible = cat === 'todas' || item.dataset.category === cat;
        item.style.display = visible ? '' : 'none';
        if (visible) visibles++;
      });
      if (notifs.length > 0) {
        vacio.style.display = visibles === 0 ? 'block' : 'none';
      }
    });
  });
});
