/**
 * tendencias.js
 * FaunaScan Perú — US62: panel de tendencias y patrones, exclusivo
 * investigador. Analiza TODOS los avistamientos reales guardados en
 * FaunaAvistamientos (comunidad completa, igual que el Mapa) -- no hay
 * ningún backend de analítica todavía, así que todo se calcula en el
 * cliente sobre los mismos datos que ya persisten registrar/historial.
 *
 * La comparación de tendencia (primera mitad del período vs segunda
 * mitad) es una aproximación simplificada de una serie de tiempo real:
 * no hay suficiente volumen de datos en esta etapa del proyecto para un
 * análisis estadístico más sofisticado, pero el cálculo es real sobre
 * los avistamientos existentes, no un número inventado.
 */
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

  const U = window.FaunaReportesUtils;
  const COLORES = ['#002D1C', '#05366A', '#F59E0B', '#7a9487'];
  const COLOR_DECLIVE = '#93001E';
  const UMBRAL_DECLIVE = -20; // % — a partir de aquí se considera una caída relevante

  function todos() {
    return window.FaunaAvistamientos ? window.FaunaAvistamientos.getAll() : [];
  }

  const rangoDesde = document.getElementById('rangoDesde');
  const rangoHasta = document.getElementById('rangoHasta');

  function datosFiltrados() {
    return U.filtrarPorRango(todos(), rangoDesde.value, rangoHasta.value);
  }

  // Devuelve los meses presentes en `lista`, ordenados cronológicamente
  // por clave "YYYY-MM" (no por el texto localizado, que no es parseable
  // de vuelta como fecha -- ver nota en reportes-utils.js).
  function mesesOrdenados(lista) {
    const porClave = {};
    lista.forEach(function (a) {
      const key = U.mesKey(a.fecha);
      if (!porClave[key]) porClave[key] = U.mesLabel(a.fecha);
    });
    return Object.keys(porClave).sort().map(function (key) {
      return { key: key, label: porClave[key] };
    });
  }

  function primeraMitadVsSegunda(conteosPorMesKey, mesesKeysOrdenadas) {
    const mitad = Math.ceil(mesesKeysOrdenadas.length / 2);
    const primera = mesesKeysOrdenadas.slice(0, mitad).reduce(function (s, k) { return s + (conteosPorMesKey[k] || 0); }, 0);
    const segunda = mesesKeysOrdenadas.slice(mitad).reduce(function (s, k) { return s + (conteosPorMesKey[k] || 0); }, 0);
    if (primera === 0) return null;
    return Math.round(((segunda - primera) / primera) * 100);
  }

  function render() {
    const lista = datosFiltrados();
    const chartWrap = document.getElementById('chartWrap');
    const chartEmpty = document.getElementById('chartEmpty');
    const legend = document.getElementById('chartLegend');
    chartWrap.innerHTML = '';
    legend.innerHTML = '';

    if (lista.length === 0) {
      chartEmpty.style.display = 'block';
      document.getElementById('alertaCard').style.display = 'none';
      document.getElementById('alertaNeutral').style.display = 'block';
      renderZonas([]);
      return;
    }
    chartEmpty.style.display = 'none';

    const meses = mesesOrdenados(lista); // [{key, label}, ...] ordenados cronológicamente
    const mesesKeys = meses.map(function (m) { return m.key; });
    const conteoEspecies = U.agruparPorEspecie(lista);
    const topEspecies = Object.keys(conteoEspecies)
      .sort(function (a, b) { return conteoEspecies[b] - conteoEspecies[a]; })
      .slice(0, 4);

    // Conteo por especie y mes (indexado por clave "YYYY-MM", no por el texto)
    const series = topEspecies.map(function (nombre, i) {
      const porMesKey = {};
      mesesKeys.forEach(function (k) { porMesKey[k] = 0; });
      lista.forEach(function (a) {
        const especieNombre = (a.especie && a.especie.nombre) || 'Especie no especificada';
        if (especieNombre === nombre) porMesKey[U.mesKey(a.fecha)]++;
      });
      const variacion = primeraMitadVsSegunda(porMesKey, mesesKeys);
      return { nombre: nombre, porMesKey: porMesKey, color: COLORES[i], variacion: variacion };
    });

    // La especie con la caída más pronunciada se pinta en rojo (criterio del prompt de referencia)
    let peorDeclive = null;
    series.forEach(function (s) {
      if (s.variacion != null && s.variacion <= UMBRAL_DECLIVE) {
        if (!peorDeclive || s.variacion < peorDeclive.variacion) peorDeclive = s;
      }
    });
    if (peorDeclive) peorDeclive.color = COLOR_DECLIVE;

    dibujarGrafico(meses, series);

    series.forEach(function (s) {
      const item = document.createElement('span');
      item.className = 'tendencias-legend__item';
      item.innerHTML = '<span class="tendencias-legend__dot" style="background:' + s.color + '"></span>' + s.nombre;
      legend.appendChild(item);
    });

    const alertaCard = document.getElementById('alertaCard');
    const alertaNeutral = document.getElementById('alertaNeutral');
    if (peorDeclive) {
      document.getElementById('alertaTexto').textContent =
        peorDeclive.nombre + ': ' + peorDeclive.variacion + '% de avistamientos en ' + meses.length + (meses.length === 1 ? ' mes' : ' meses');
      alertaCard.style.display = 'flex';
      alertaNeutral.style.display = 'none';
    } else {
      alertaCard.style.display = 'none';
      alertaNeutral.style.display = 'flex';
    }

    renderZonas(lista);
  }

  function dibujarGrafico(meses, series) {
    const chartWrap = document.getElementById('chartWrap');
    const W = 560, H = 220, PAD = 30;
    const max = Math.max(1, ...series.map(function (s) { return Math.max.apply(null, Object.values(s.porMesKey)); }));

    function x(i) { return meses.length > 1 ? PAD + (i * (W - PAD * 2)) / (meses.length - 1) : W / 2; }
    function y(v) { return H - PAD - (v / max) * (H - PAD * 2); }

    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:100%;height:auto;">';
    // Ejes simples
    svg += '<line x1="' + PAD + '" y1="' + (H - PAD) + '" x2="' + (W - PAD) + '" y2="' + (H - PAD) + '" stroke="#dde8e1" stroke-width="1"/>';

    series.forEach(function (s) {
      const puntos = meses.map(function (m, i) { return x(i) + ',' + y(s.porMesKey[m.key]); }).join(' ');
      svg += '<polyline points="' + puntos + '" fill="none" stroke="' + s.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
      meses.forEach(function (m, i) {
        svg += '<circle cx="' + x(i) + '" cy="' + y(s.porMesKey[m.key]) + '" r="3" fill="' + s.color + '"/>';
      });
    });

    meses.forEach(function (m, i) {
      const etiqueta = m.label.split(' ')[0].slice(0, 3);
      svg += '<text x="' + x(i) + '" y="' + (H - PAD + 16) + '" font-size="10" fill="#7a9487" text-anchor="middle">' + etiqueta + '</text>';
    });

    svg += '</svg>';
    chartWrap.innerHTML = svg;
  }

  function renderZonas(lista) {
    const tabla = document.getElementById('zonasTabla');
    const vacio = document.getElementById('zonasEmpty');
    tabla.innerHTML = '';

    const conZona = lista.filter(function (a) { return a.area; });
    if (conZona.length === 0) {
      vacio.style.display = 'block';
      return;
    }
    vacio.style.display = 'none';

    const porZona = {};
    conZona.forEach(function (a) {
      if (!porZona[a.area]) porZona[a.area] = [];
      porZona[a.area].push(a);
    });

    const maxTotal = Math.max.apply(null, Object.keys(porZona).map(function (z) { return porZona[z].length; }));

    Object.keys(porZona)
      .sort(function (a, b) { return porZona[b].length - porZona[a].length; })
      .forEach(function (zona) {
        const registros = porZona[zona];
        const porMesKey = {};
        registros.forEach(function (a) {
          const k = U.mesKey(a.fecha);
          porMesKey[k] = (porMesKey[k] || 0) + 1;
        });
        const mesesZonaKeys = Object.keys(porMesKey).sort();
        const variacion = primeraMitadVsSegunda(porMesKey, mesesZonaKeys);
        const pct = Math.round((registros.length / maxTotal) * 100);

        let claseVar = 'zona-row__variacion--flat', textoVar = '—';
        if (variacion != null) {
          textoVar = (variacion > 0 ? '+' : '') + variacion + '%';
          claseVar = variacion > 0 ? 'zona-row__variacion--up' : (variacion < 0 ? 'zona-row__variacion--down' : 'zona-row__variacion--flat');
        }

        const row = document.createElement('div');
        row.className = 'zona-row';
        row.innerHTML =
          '<span class="zona-row__nombre">' + zona + '</span>' +
          '<span class="zona-row__bar"><span class="zona-row__bar-fill" style="width:' + pct + '%"></span></span>' +
          '<span class="zona-row__variacion ' + claseVar + '">' + textoVar + '</span>';
        tabla.appendChild(row);
      });
  }

  rangoDesde.addEventListener('change', render);
  rangoHasta.addEventListener('change', render);
  render();
});
