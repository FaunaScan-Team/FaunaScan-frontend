/**
 * resumen.js
 * FaunaScan Perú — US19: resumen mensual de biodiversidad (investigador).
 *
 * Antes la pantalla completa era ficción: seis meses fijos en la lista
 * (Diciembre 2025 a Mayo 2026), "142 registros / 23 especies / 4 zonas
 * / 3 alertas", cuatro zonas con conteos inventados y tres alertas
 * redactadas a mano ("Jaguar avistado en zona de alta actividad
 * humana", "Reducción del 15% en avistamientos de cóndor andino",
 * "Nuevo récord de registros en un solo día: 18 el 5 de mayo"). Al
 * hacer clic en un mes solo cambiaba el título; los números nunca se
 * movían.
 *
 * Ahora la lista de meses son los meses que realmente tienen
 * avistamientos y cada métrica se recalcula sobre ese mes. Las alertas
 * se generan únicamente a partir de lo que se puede calcular de verdad:
 * especies en peligro registradas, variación de registros contra el mes
 * anterior y el día con más registros del mes. Si no hay nada que
 * reportar se muestra un estado vacío en vez de inventar hallazgos.
 *
 * El resumen cubre los avistamientos de toda la comunidad (no solo los
 * propios), porque US19 pide "un panorama rápido del estado del área".
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

  const U = window.FaunaReportesUtils;
  const todos = window.FaunaAvistamientos ? window.FaunaAvistamientos.getAll() : [];

  // Agrupa por clave ordenable "YYYY-MM": mesLabel() devuelve texto
  // localizado que no se puede reordenar cronológicamente.
  const porMes = {};
  todos.forEach(function (a) {
    const clave = U.mesKey(a.fecha);
    if (clave === '0000-00') return;
    if (!porMes[clave]) porMes[clave] = [];
    porMes[clave].push(a);
  });
  const clavesOrdenadas = Object.keys(porMes).sort().reverse();

  const titulo = document.getElementById('resumenTitulo');
  const listaMeses = document.getElementById('mesesList');
  const zonasGrid = document.getElementById('zonasGrid');
  const alertasList = document.getElementById('alertasList');

  function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  function etiquetaMes(clave) {
    return capitalizar(U.mesLabel(porMes[clave][0].fecha));
  }

  const COLORES_BADGE = ['badge-green', 'badge-blue', 'badge-yellow', 'badge-gray'];

  function pintarZonas(lista) {
    zonasGrid.innerHTML = '';
    const conteo = {};
    lista.forEach(function (a) {
      if (!a.area) return;
      conteo[a.area] = (conteo[a.area] || 0) + 1;
    });
    const zonas = Object.keys(conteo).sort(function (x, y) { return conteo[y] - conteo[x]; });

    document.getElementById('zonasEmpty').style.display = zonas.length ? 'none' : 'block';
    zonas.forEach(function (zona, i) {
      const card = document.createElement('div');
      card.className = 'zona-card';
      const nombre = document.createElement('span');
      nombre.className = 'zona-card__name';
      nombre.textContent = zona;
      const badge = document.createElement('span');
      badge.className = 'badge ' + COLORES_BADGE[i % COLORES_BADGE.length];
      badge.textContent = conteo[zona] + ' reg.';
      card.appendChild(nombre);
      card.appendChild(badge);
      zonasGrid.appendChild(card);
    });
  }

  function diaConMasRegistros(lista) {
    const conteo = {};
    lista.forEach(function (a) {
      const f = new Date(a.fecha);
      if (isNaN(f.getTime())) return;
      const clave = f.toISOString().slice(0, 10);
      conteo[clave] = (conteo[clave] || 0) + 1;
    });
    let dia = null, max = 0;
    Object.keys(conteo).forEach(function (d) {
      if (conteo[d] > max) { max = conteo[d]; dia = d; }
    });
    return dia ? { dia: dia, cantidad: max } : null;
  }

  function pintarAlertas(clave, lista) {
    alertasList.innerHTML = '';
    const alertas = [];

    const criticas = U.contarCriticas(lista);
    if (criticas > 0) {
      const especies = Array.from(U.especiesUnicas(lista.filter(function (a) {
        return a.especie && U.esCritica(a.especie.estado);
      })));
      alertas.push({
        clase: 'alerta-item--red',
        texto: '🚨 ' + criticas + (criticas === 1 ? ' avistamiento' : ' avistamientos') +
               ' de especies en peligro este mes (' + especies.join(', ') + ').'
      });
    }

    // Variación contra el mes inmediatamente anterior con registros.
    const posicion = clavesOrdenadas.indexOf(clave);
    const claveAnterior = clavesOrdenadas[posicion + 1];
    if (claveAnterior) {
      const anterior = porMes[claveAnterior].length;
      const variacion = Math.round(((lista.length - anterior) / anterior) * 100);
      if (variacion <= -15) {
        alertas.push({
          clase: 'alerta-item--yellow',
          texto: '⚠️ Los registros bajaron ' + Math.abs(variacion) + '% respecto a ' +
                 etiquetaMes(claveAnterior) + ' (' + anterior + ' → ' + lista.length + ').'
        });
      } else if (variacion >= 15) {
        alertas.push({
          clase: 'alerta-item--blue',
          texto: 'ℹ️ Los registros subieron ' + variacion + '% respecto a ' +
                 etiquetaMes(claveAnterior) + ' (' + anterior + ' → ' + lista.length + ').'
        });
      }
    }

    const pico = diaConMasRegistros(lista);
    if (pico && pico.cantidad > 1) {
      const fecha = new Date(pico.dia + 'T12:00:00');
      alertas.push({
        clase: 'alerta-item--blue',
        texto: 'ℹ️ Día con más actividad: ' + pico.cantidad + ' registros el ' +
               fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }) + '.'
      });
    }

    document.getElementById('alertasEmpty').style.display = alertas.length ? 'none' : 'block';
    alertas.forEach(function (alerta) {
      const item = document.createElement('div');
      item.className = 'alerta-item ' + alerta.clase;
      item.textContent = alerta.texto;
      alertasList.appendChild(item);
    });
    return alertas.length;
  }

  function mostrarMes(clave) {
    const lista = porMes[clave];
    titulo.textContent = etiquetaMes(clave);
    document.getElementById('statRegistros').textContent = lista.length;
    document.getElementById('statEspecies').textContent = U.especiesUnicas(lista).size;
    document.getElementById('statZonas').textContent = U.zonasUnicas(lista).size;
    pintarZonas(lista);
    document.getElementById('statAlertas').textContent = pintarAlertas(clave, lista);
  }

  if (clavesOrdenadas.length === 0) {
    document.getElementById('mesesEmpty').style.display = 'block';
    document.getElementById('zonasEmpty').style.display = 'block';
    document.getElementById('alertasEmpty').style.display = 'block';
    titulo.textContent = 'Sin avistamientos registrados';
    return;
  }

  clavesOrdenadas.forEach(function (clave, i) {
    const item = document.createElement('li');
    item.className = 'mes-item' + (i === 0 ? ' mes-item--active' : '');
    item.dataset.mes = clave;
    const nombre = document.createElement('span');
    nombre.className = 'mes-item__name';
    nombre.textContent = etiquetaMes(clave);
    item.appendChild(nombre);
    item.addEventListener('click', function () {
      listaMeses.querySelectorAll('.mes-item').forEach(function (m) {
        m.classList.remove('mes-item--active');
      });
      item.classList.add('mes-item--active');
      mostrarMes(clave);
    });
    listaMeses.appendChild(item);
  });

  mostrarMes(clavesOrdenadas[0]);
});
