/**
 * verificar.js
 * FaunaScan Perú — US45: cola de validación del investigador.
 *
 * Antes la cola eran tres registros fijos en el HTML (Oso de anteojos
 * de "Kevin A.", Anaconda verde de "Roberto S.", Cóndor andino de
 * "Sergio E.", con fechas de mayo de 2026), el contador decía siempre
 * "3", y lo más grave: "Validar" y "Rechazar" solo cambiaban el texto
 * del badge en el DOM. Nada se guardaba, así que al recargar la página
 * volvía todo a "PENDIENTE" y ningún avistamiento del store pasaba
 * nunca a "Validado" — por eso porcentajeValidados() en
 * reportes-utils.js y la notificación "Tu registro fue validado"
 * nunca podían activarse con datos reales.
 *
 * Ahora la cola son los avistamientos con estadoValidacion
 * "Pendiente", excluyendo los del propio investigador (US45: se validan
 * los registros "enviados por voluntarios u otros investigadores"), y
 * validar/rechazar escribe en FaunaAvistamientos junto con quién validó
 * y cuándo — los mismos campos que el modelo de datos agregó para esta
 * US (id_investigador_validador / fecha_validacion).
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

  const usuario = window.FaunaAuth ? window.FaunaAuth.user : null;
  const lista = document.getElementById('verificarList');
  const vacio = document.getElementById('verificarEmpty');
  const contador = document.getElementById('pendienteCount');

  function pendientes() {
    if (!window.FaunaAvistamientos) return [];
    return window.FaunaAvistamientos.getAll().filter(function (a) {
      const esPropio = a.registradoPor && usuario && a.registradoPor.email === usuario.email;
      return a.estadoValidacion === 'Pendiente' && !esPropio;
    });
  }

  function fechaLegible(iso) {
    const f = new Date(iso);
    if (isNaN(f.getTime())) return 'Sin fecha';
    return f.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + f.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  function nombreAutor(autor) {
    if (!autor || !autor.nombre) return 'Usuario sin identificar';
    return autor.nombre + (autor.apellido ? ' ' + autor.apellido.charAt(0) + '.' : '');
  }

  function resolver(av, item, nuevoEstado) {
    window.FaunaAvistamientos.update(av.id, {
      estadoValidacion: nuevoEstado,
      validadoPor: usuario ? {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email
      } : null,
      fechaValidacion: new Date().toISOString()
    });

    const badge = item.querySelector('.status-badge');
    if (nuevoEstado === 'Validado') {
      badge.textContent = 'VALIDADO';
      badge.className = 'badge badge-green status-badge';
    } else {
      badge.textContent = 'RECHAZADO';
      badge.className = 'badge badge-gray status-badge';
      item.classList.add('dimmed');
    }
    item.querySelectorAll('button').forEach(function (b) { b.disabled = true; });

    const restantes = Number(contador.textContent) - 1;
    contador.textContent = restantes < 0 ? 0 : restantes;
  }

  const registros = pendientes();
  contador.textContent = registros.length;

  if (registros.length === 0) {
    vacio.style.display = 'block';
    return;
  }

  registros.forEach(function (av) {
    const especie = av.especie || {};

    const item = document.createElement('div');
    item.className = 'verificar-item card';
    item.dataset.id = av.id;

    const foto = document.createElement('div');
    foto.className = 'verificar-item__img verificar-item__img--clickable';
    if (av.foto && av.foto.src) {
      const img = document.createElement('img');
      img.src = av.foto.src;
      img.alt = especie.nombre || '';
      foto.appendChild(img);
    } else {
      foto.textContent = especie.emoji || '🐾';
    }
    foto.addEventListener('click', function () {
      window.location.href = 'verificar-detalle.html?id=' + encodeURIComponent(av.id);
    });

    const info = document.createElement('div');
    info.className = 'verificar-item__info';
    const nombre = document.createElement('h3');
    nombre.className = 'verificar-item__nombre';
    nombre.textContent = especie.nombre || 'Especie no especificada';
    const cientifico = document.createElement('p');
    cientifico.className = 'verificar-item__cientifico';
    cientifico.textContent = especie.cientifico || '';
    const meta = document.createElement('p');
    meta.className = 'verificar-item__meta';
    meta.textContent = '📍 ' + (av.area || 'Sin área especificada') + ' · ' +
      nombreAutor(av.registradoPor) + ' · ' + fechaLegible(av.fecha);
    info.appendChild(nombre);
    info.appendChild(cientifico);
    info.appendChild(meta);

    const descripcion = av.observaciones && av.observaciones.descripcion;
    if (descripcion) {
      const obs = document.createElement('p');
      obs.className = 'verificar-item__obs';
      obs.textContent = descripcion;
      info.appendChild(obs);
    }

    const estado = document.createElement('div');
    estado.className = 'verificar-item__status';
    const badge = document.createElement('span');
    badge.className = 'badge badge-yellow status-badge';
    badge.textContent = 'PENDIENTE';
    estado.appendChild(badge);

    const acciones = document.createElement('div');
    acciones.className = 'verificar-item__actions';
    const btnValidar = document.createElement('button');
    btnValidar.className = 'btn btn-primary btn-sm btn-validar';
    btnValidar.textContent = 'Validar';
    btnValidar.addEventListener('click', function () { resolver(av, item, 'Validado'); });
    const btnRechazar = document.createElement('button');
    btnRechazar.className = 'btn btn-outline btn-sm btn-rechazar';
    btnRechazar.textContent = 'Rechazar';
    btnRechazar.addEventListener('click', function () { resolver(av, item, 'Rechazado'); });
    acciones.appendChild(btnValidar);
    acciones.appendChild(btnRechazar);

    item.appendChild(foto);
    item.appendChild(info);
    item.appendChild(estado);
    item.appendChild(acciones);
    lista.appendChild(item);
  });
});
