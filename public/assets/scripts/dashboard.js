/**
 * dashboard.js
 * FaunaScan Perú — Paneles principales diferenciados por rol
 * (US22, US23, US54, US55, US65, US66).
 *
 * Script compartido por dashboard-investigador.html y
 * dashboard-voluntario.html: cada bloque se activa solo si su elemento
 * existe en la página, así que el panel del investigador nunca ejecuta
 * la racha ni el onboarding del voluntario.
 *
 * Antes, ambos paneles mostraban los mismos datos fijos escritos en el
 * HTML: "142 avistamientos / 38 especies / 7 zonas" con deltas
 * inventados ("+2 este día", "+3 este mes"), insignias fijas ("100
 * registros", "5 zonas", "IA explorador") y un feed de actividad de 4
 * entradas con usuarios que no existen ("Kevin A.", "Roberto S.",
 * "Sergio E.") y horas congeladas en el atributo datetime. Nada de eso
 * salía de los avistamientos reales.
 *
 * Ahora todo se calcula sobre FaunaAvistamientos:
 * - "Mi progreso": avistamientos/especies/zonas del usuario autenticado,
 *   con deltas reales (registros de hoy, especies nuevas del mes).
 * - "Logros": solo los umbrales realmente alcanzados. Se eliminó la
 *   insignia "IA explorador" porque no existe ningún dato que permita
 *   saber si el usuario usó la identificación por IA (el avistamiento
 *   no guarda ese origen), así que no hay forma honesta de otorgarla.
 * - "Actividad reciente de la comunidad": los avistamientos más
 *   recientes de todo el store, con autor, especie, zona, coordenadas
 *   reales y tiempo relativo calculado.
 * - Racha del voluntario (US65): días calendario consecutivos con al
 *   menos un avistamiento propio, contados hacia atrás desde hoy.
 */
document.addEventListener('DOMContentLoaded', function () {

  var user = JSON.parse(localStorage.getItem('faunaUser') || 'null');
  var U = window.FaunaReportesUtils;

  var nameEl = document.querySelector('#welcomeName');
  if (user && nameEl) {
    nameEl.textContent = 'Bienvenido de regreso, ' + user.nombre;
  }

  var dateEl = document.querySelector('#welcomeDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  var toggle  = document.querySelector('.sidebar-toggle');

  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  var currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar__link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href === currentPage) { link.classList.add('active'); }
  });

  var todos = window.FaunaAvistamientos ? window.FaunaAvistamientos.getAll() : [];
  var mios = user ? todos.filter(function (a) {
    return a.registradoPor && a.registradoPor.email === user.email;
  }) : [];

  // ---------- Mi progreso (US23) ----------
  function mismoDia(fechaIso, referencia) {
    var f = new Date(fechaIso);
    return !isNaN(f.getTime()) && f.toDateString() === referencia.toDateString();
  }

  function especiesNuevasEsteMes(lista) {
    var primeraVez = {};
    lista.forEach(function (a) {
      var nombre = a.especie && a.especie.nombre;
      var t = new Date(a.fecha).getTime();
      if (!nombre || isNaN(t)) return;
      if (!(nombre in primeraVez) || t < primeraVez[nombre]) primeraVez[nombre] = t;
    });
    var mesActual = U.mesKey(new Date().toISOString());
    return Object.keys(primeraVez).filter(function (nombre) {
      return U.mesKey(new Date(primeraVez[nombre]).toISOString()) === mesActual;
    }).length;
  }

  function pintarDelta(el, cantidad, textoPositivo, textoVacio) {
    if (!el) return;
    el.classList.remove('progress-item__delta--positive', 'progress-item__delta--neutral');
    if (cantidad > 0) {
      el.textContent = '+' + cantidad + ' ' + textoPositivo;
      el.classList.add('progress-item__delta--positive');
    } else {
      el.textContent = textoVacio;
      el.classList.add('progress-item__delta--neutral');
    }
  }

  var elAvistamientos = document.getElementById('progressAvistamientos');
  if (elAvistamientos) {
    var hoy = new Date();
    var registrosHoy = mios.filter(function (a) { return mismoDia(a.fecha, hoy); }).length;

    elAvistamientos.textContent = mios.length;
    document.getElementById('progressEspecies').textContent = U.especiesUnicas(mios).size;
    document.getElementById('progressZonas').textContent = U.zonasUnicas(mios).size;

    pintarDelta(document.getElementById('progressAvistamientosDelta'), registrosHoy, 'hoy', 'Sin registros hoy');
    pintarDelta(document.getElementById('progressEspeciesDelta'), especiesNuevasEsteMes(mios), 'este mes', 'Sin especies nuevas');
  }

  // ---------- Logros (umbrales reales alcanzados) ----------
  var UMBRALES_REGISTROS = [5, 10, 25, 50, 100];
  var UMBRALES_ZONAS = [3, 5, 10, 20];

  function umbralAlcanzado(total, umbrales) {
    var alcanzado = null;
    umbrales.forEach(function (u) { if (total >= u) alcanzado = u; });
    return alcanzado;
  }

  var listaLogros = document.getElementById('achievementsList');
  if (listaLogros && user) {
    var logros = [user.rol === 'investigador' ? 'investigador' : 'voluntario'];

    var umbralRegistros = umbralAlcanzado(mios.length, UMBRALES_REGISTROS);
    if (umbralRegistros) logros.push(umbralRegistros + '+ avistamientos');

    var umbralZonas = umbralAlcanzado(U.zonasUnicas(mios).size, UMBRALES_ZONAS);
    if (umbralZonas) logros.push(umbralZonas + '+ zonas');

    logros.forEach(function (texto) {
      var tag = document.createElement('span');
      tag.className = 'achievement-tag';
      tag.setAttribute('role', 'listitem');
      tag.textContent = texto;
      listaLogros.appendChild(tag);
    });

    if (!umbralRegistros && !umbralZonas) {
      document.getElementById('achievementsEmpty').style.display = 'block';
    }
  }

  // ---------- Actividad reciente de la comunidad ----------
  function tiempoRelativo(iso) {
    var f = new Date(iso);
    if (isNaN(f.getTime())) return '—';
    var minutos = Math.round((Date.now() - f.getTime()) / 60000);
    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return 'Hace ' + minutos + ' min';
    var horas = Math.round(minutos / 60);
    if (horas < 24) return 'Hace ' + horas + (horas === 1 ? ' hora' : ' horas');
    var dias = Math.round(horas / 24);
    return 'Hace ' + dias + (dias === 1 ? ' día' : ' días');
  }

  // Sin estado de conservación no se pinta ninguna etiqueta: inventar
  // "NO VULNERABLE" para una especie de la que no sabemos el estado
  // sería afirmar algo que el registro no dice.
  function claseVulnerabilidad(estado) {
    if (!estado) return null;
    var e = estado.toUpperCase();
    if (e.indexOf('NO VULNERABLE') !== -1 || e.indexOf('MENOR') !== -1) return 'vuln-badge--ok';
    if (e.indexOf('PELIGRO') !== -1 || e.indexOf('VULNERABLE') !== -1 || e.indexOf('CRÍTIC') !== -1) return 'vuln-badge--vulnerable';
    return 'vuln-badge--ok';
  }

  var COLORES_AVATAR = ['activity-item__avatar--orange', 'activity-item__avatar--blue', 'activity-item__avatar--red', 'activity-item__avatar--green'];

  var listaActividad = document.getElementById('activityList');
  if (listaActividad) {
    var recientes = todos.slice().sort(function (a, b) {
      return new Date(b.creadoEn || b.fecha) - new Date(a.creadoEn || a.fecha);
    }).slice(0, 4);

    if (recientes.length === 0) {
      document.getElementById('activityEmpty').style.display = 'block';
    } else {
      recientes.forEach(function (a, i) {
        var autor = a.registradoPor || {};
        var especie = a.especie || {};
        var nombreAutor = autor.nombre
          ? autor.nombre + (autor.apellido ? ' ' + autor.apellido.charAt(0) + '.' : '')
          : 'Usuario sin identificar';
        var inicial = (autor.nombre || '?').charAt(0).toUpperCase();
        var claseVuln = claseVulnerabilidad(especie.estado);

        var item = document.createElement('li');
        item.className = 'activity-item';

        var avatar = document.createElement('div');
        avatar.className = 'activity-item__avatar ' + COLORES_AVATAR[i % COLORES_AVATAR.length];
        avatar.setAttribute('aria-hidden', 'true');
        avatar.textContent = inicial;

        var info = document.createElement('div');
        info.className = 'activity-item__info';

        var texto = document.createElement('p');
        texto.className = 'activity-item__text';
        texto.textContent = nombreAutor + ' registró ' + (especie.nombre || 'una especie no especificada') + (a.area ? ' · ' + a.area : '');
        info.appendChild(texto);

        var meta = document.createElement('p');
        meta.className = 'activity-item__meta';
        if (claseVuln) {
          var badge = document.createElement('span');
          badge.className = 'vuln-badge ' + claseVuln;
          badge.textContent = especie.estado;
          meta.appendChild(badge);
        }
        if (a.lat != null && a.lng != null) {
          var coords = document.createElement('span');
          coords.className = 'activity-item__time';
          coords.textContent = 'Coordenadas: ' + Number(a.lat).toFixed(2) + ', ' + Number(a.lng).toFixed(2);
          meta.appendChild(coords);
        }
        if (meta.childNodes.length) info.appendChild(meta);

        var tiempo = document.createElement('time');
        tiempo.className = 'activity-item__time';
        var fechaRef = a.creadoEn || a.fecha;
        tiempo.setAttribute('datetime', fechaRef || '');
        tiempo.textContent = tiempoRelativo(fechaRef);

        item.appendChild(avatar);
        item.appendChild(info);
        item.appendChild(tiempo);
        listaActividad.appendChild(item);
      });
    }
  }

  // ---------- Racha de participación (US65, solo voluntario) ----------
  var streakNum = document.getElementById('streakNum');
  if (streakNum) {
    var diasConRegistro = new Set();
    mios.forEach(function (a) {
      var f = new Date(a.fecha);
      if (!isNaN(f.getTime())) diasConRegistro.add(f.toDateString());
    });

    var cursor = new Date();
    // Una racha en curso puede terminar ayer: no haber registrado todavía
    // hoy no debería romperla.
    if (!diasConRegistro.has(cursor.toDateString())) {
      cursor.setDate(cursor.getDate() - 1);
    }
    var racha = 0;
    while (diasConRegistro.has(cursor.toDateString())) {
      racha++;
      cursor.setDate(cursor.getDate() - 1);
    }

    streakNum.textContent = racha;
    var streakLabel = document.getElementById('streakLabel');
    if (streakLabel) {
      streakLabel.textContent = racha === 0
        ? 'registra hoy para empezar tu racha'
        : (racha === 1 ? 'día activo' : 'días activos seguidos');
    }
  }

  // ---------- Onboarding guiado (US66, solo voluntario, primer ingreso) ----------
  var modalOnboarding = document.getElementById('modalOnboarding');
  if (modalOnboarding && user) {
    var PASOS = [
      {
        titulo: '1. Registra lo que viste',
        texto: 'Toca "Nuevo Registro" en tu panel. Puedes adjuntar una foto del animal, indicar la zona y usar tu ubicación actual.'
      },
      {
        titulo: '2. Identifica la especie',
        texto: 'Elige la especie desde el catálogo o busca por nombre. Si no estás seguro, puedes probar la identificación por foto y corregirla antes de guardar.'
      },
      {
        titulo: '3. Revisa tu contribución',
        texto: 'Guarda el avistamiento y míralo en tu Historial. En "Mi contribución" puedes ver cuántas especies y zonas has aportado.'
      }
    ];

    // register.js ya creaba la cuenta con onboardingCompletado:false, así
    // que el flag vive en el propio usuario en vez de en una clave aparte.
    if (user.onboardingCompletado !== true) {
      var paso = 0;
      var tituloEl = document.getElementById('onboardingTitulo');
      var textoEl = document.getElementById('onboardingTexto');
      var puntos = document.querySelectorAll('#onboardingDots .onboarding-dot');
      var btnSiguiente = document.getElementById('btnOnboardingSiguiente');
      var btnOmitir = document.getElementById('btnOnboardingOmitir');

      function pintarPaso() {
        tituloEl.textContent = PASOS[paso].titulo;
        textoEl.textContent = PASOS[paso].texto;
        puntos.forEach(function (p, i) {
          p.classList.toggle('onboarding-dot--active', i === paso);
        });
        btnSiguiente.textContent = paso === PASOS.length - 1 ? 'Entendido' : 'Siguiente';
      }

      function cerrarOnboarding() {
        user.onboardingCompletado = true;
        localStorage.setItem('faunaUser', JSON.stringify(user));
        modalOnboarding.classList.remove('open');
      }

      btnSiguiente.addEventListener('click', function () {
        if (paso === PASOS.length - 1) {
          cerrarOnboarding();
        } else {
          paso++;
          pintarPaso();
        }
      });
      btnOmitir.addEventListener('click', cerrarOnboarding);

      pintarPaso();
      modalOnboarding.classList.add('open');
    }
  }
});
