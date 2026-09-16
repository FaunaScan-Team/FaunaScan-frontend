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
  const TODOS = window.FaunaAvistamientos ? window.FaunaAvistamientos.getAll() : [];

  const tipoSelect = document.getElementById('reporteTipo');
  const grupoInstitucion = document.getElementById('grupoInstitucion');
  if (tipoSelect && grupoInstitucion) {
    tipoSelect.addEventListener('change', function () {
      grupoInstitucion.style.display = tipoSelect.value === 'institucional' ? 'block' : 'none';
    });
  }

  let ultimoResultado = null;

  function renderTabla(lista) {
    const tbody = document.getElementById('reporteTablaBody');
    const tabla = document.getElementById('reporteTablaWrap');
    const vacio = document.getElementById('reporteEmpty');
    tbody.innerHTML = '';
    if (lista.length === 0) {
      tabla.style.display = 'none';
      vacio.style.display = 'block';
      return;
    }
    tabla.style.display = '';
    vacio.style.display = 'none';

    const conteo = U.agruparPorEspecie(lista);
    const max = Math.max.apply(null, Object.values(conteo));
    const estadoPorEspecie = {};
    lista.forEach(function (a) {
      const nombre = (a.especie && a.especie.nombre) || 'Especie no especificada';
      if (!estadoPorEspecie[nombre]) estadoPorEspecie[nombre] = a.especie && a.especie.estado;
    });

    Object.keys(conteo).sort(function (a, b) { return conteo[b] - conteo[a]; }).forEach(function (nombre) {
      const cantidad = conteo[nombre];
      const estado = (estadoPorEspecie[nombre] || '').toUpperCase();
      let badgeClass = 'badge-green', badgeTexto = 'Menor';
      if (estado.indexOf('PELIGRO') !== -1) { badgeClass = 'badge-red'; badgeTexto = 'Crítico'; }
      else if (estado.indexOf('VULNERABLE') !== -1) { badgeClass = 'badge-yellow'; badgeTexto = 'Vulnerable'; }
      const pct = Math.round((cantidad / max) * 100);
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + nombre + '</td><td>' + cantidad + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + badgeTexto + '</span></td>' +
        '<td><div class="trend-bar"><div class="trend-fill trend-fill--up" style="width:' + pct + '%"></div></div></td>';
      tbody.appendChild(tr);
    });
  }

  function renderChart(lista) {
    const contenedor = document.getElementById('chartBars');
    contenedor.innerHTML = '';
    if (lista.length === 0) return;
    const conteo = U.agruparPorEspecie(lista);
    const max = Math.max.apply(null, Object.values(conteo));
    Object.keys(conteo).forEach(function (nombre) {
      const cantidad = conteo[nombre];
      const pct = Math.max(8, Math.round((cantidad / max) * 100));
      const wrap = document.createElement('div');
      wrap.className = 'chart-bar-wrap';
      wrap.innerHTML =
        '<div class="chart-bar chart-bar--accent" style="height:' + pct + '%"></div>' +
        '<span>' + nombre.split(' ')[0] + '</span>';
      contenedor.appendChild(wrap);
    });
  }

  function generarReporte() {
    const area = document.getElementById('reporteArea');
    const desde = document.getElementById('reporteDesde');
    const hasta = document.getElementById('reporteHasta');
    const tipo = document.getElementById('reporteTipo');
    const institucion = document.getElementById('reporteInstitucion');

    let filtrados = U.filtrarPorArea(TODOS, area ? area.value : '');
    filtrados = U.filtrarPorRango(filtrados, desde ? desde.value : '', hasta ? hasta.value : '');
    if (tipo && tipo.value === 'amenazadas') {
      filtrados = filtrados.filter(function (a) { return a.especie && U.esCritica(a.especie.estado); });
    }

    const zonaTexto = area && area.value ? area.value : 'Todas las zonas';
    const rangoTexto = (desde && desde.value ? desde.value : '…') + ' al ' + (hasta && hasta.value ? hasta.value : '…');

    document.getElementById('bannerTitulo').textContent =
      (tipo ? tipo.options[tipo.selectedIndex].text : 'Reporte') + ' — ' + zonaTexto;
    document.getElementById('bannerSub').textContent = rangoTexto + ' · ' + filtrados.length + ' avistamientos';

    renderTabla(filtrados);
    renderChart(filtrados);

    ultimoResultado = {
      tipo: tipo ? tipo.value : 'biodiversidad',
      tipoTexto: tipo ? tipo.options[tipo.selectedIndex].text : 'Reporte',
      area: zonaTexto,
      desde: desde ? desde.value : '',
      hasta: hasta ? hasta.value : '',
      institucion: (tipo && tipo.value === 'institucional' && institucion) ? institucion.value.trim() : '',
      avistamientos: filtrados
    };
    document.getElementById('btnGuardarReporte').disabled = filtrados.length === 0;
  }

  const btnGenerar = document.getElementById('btnGenerar');
  if (btnGenerar) {
    btnGenerar.addEventListener('click', function () {
      btnGenerar.textContent = 'Generando...';
      btnGenerar.disabled = true;
      setTimeout(function () {
        generarReporte();
        btnGenerar.textContent = 'Generar reporte';
        btnGenerar.disabled = false;
      }, 400);
    });
  }

  const btnGuardarReporte = document.getElementById('btnGuardarReporte');
  if (btnGuardarReporte) {
    btnGuardarReporte.addEventListener('click', function () {
      if (!ultimoResultado || btnGuardarReporte.disabled) return;
      const usuario = JSON.parse(localStorage.getItem('faunaUser') || 'null');
      const lista = ultimoResultado.avistamientos;
      const top = U.especieTop(lista);

      window.FaunaReportes.add({
        id: window.FaunaReportes.generarId(),
        titulo: ultimoResultado.tipoTexto + ' — ' + ultimoResultado.area,
        tipo: ultimoResultado.tipo,
        area: ultimoResultado.area,
        institucion: ultimoResultado.institucion,
        periodo: (ultimoResultado.desde || '—') + ' al ' + (ultimoResultado.hasta || '—'),
        avistamientos: lista.length,
        especies: U.especiesUnicas(lista).size,
        criticas: U.contarCriticas(lista),
        validados: U.porcentajeValidados(lista),
        especieTop: top ? (top.nombre + ' (' + top.cantidad + ' av.)') : '—',
        generadoPor: usuario ? { nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, credencialVerificada: usuario.credencialVerificada === true } : null,
        generadoEn: new Date().toISOString()
      });

      btnGuardarReporte.textContent = 'Guardado ✓';
      setTimeout(function () {
        btnGuardarReporte.textContent = 'Guardar reporte';
      }, 1500);
    });
  }
});
