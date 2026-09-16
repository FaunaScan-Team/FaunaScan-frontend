/**
 * identificar-ia.js
 * FaunaScan Perú — Identificación por IA (US27-US30, US53).
 *
 * IMPORTANTE: no existe ningún modelo de IA ni backend real conectado
 * todavía. Antes, esta pantalla mostraba siempre el mismo resultado fijo
 * ("Oso de Anteojos, 92%") sin importar la foto subida, presentado como si
 * fuera un análisis real. Aquí se simula un resultado que VARÍA en cada
 * intento (especie + nivel de confianza al azar dentro de un catálogo fijo)
 * y, cuando la confianza simulada cae bajo el umbral, se muestra el estado
 * "no identificado" (US53) en vez de forzar siempre un resultado exitoso.
 * Esto sigue sin ser un análisis real de la imagen — se documenta como tal
 * en el aviso visible de la pantalla — pero al menos no repite la misma
 * respuesta fija sin relación con la foto.
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

  const foto = JSON.parse(localStorage.getItem('faunaFotoRegistro') || 'null');
  if (foto && foto.src) {
    document.getElementById('identificarFoto').src = foto.src;
  }

  const UMBRAL_CONFIANZA = 55;
  const POOL = [
    { nombre: 'Oso de Anteojos', cientifico: 'Tremarctos ornatus', emoji: '🐻',
      alternativas: [
        { nombre: 'Oso negro americano', cientifico: 'Ursus americanus', emoji: '🐻' },
        { nombre: 'Oso panda', cientifico: 'Ailuropoda melanoleuca', emoji: '🐼' }
      ] },
    { nombre: 'Cóndor Andino', cientifico: 'Vultur gryphus', emoji: '🦅',
      alternativas: [
        { nombre: 'Águila mora', cientifico: 'Geranoaetus melanoleucus', emoji: '🦅' },
        { nombre: 'Gallinazo de cabeza negra', cientifico: 'Coragyps atratus', emoji: '🦃' }
      ] },
    { nombre: 'Jaguar', cientifico: 'Panthera onca', emoji: '🐆',
      alternativas: [
        { nombre: 'Ocelote', cientifico: 'Leopardus pardalis', emoji: '🐆' },
        { nombre: 'Puma', cientifico: 'Puma concolor', emoji: '🐈' }
      ] },
    { nombre: 'Guacamayo Rojo', cientifico: 'Ara macao', emoji: '🦜',
      alternativas: [
        { nombre: 'Guacamayo azul y amarillo', cientifico: 'Ara ararauna', emoji: '🦜' }
      ] }
  ];

  function simularResultado() {
    const base = POOL[Math.floor(Math.random() * POOL.length)];
    const confianza = Math.floor(Math.random() * 70) + 25; // 25% – 94%
    return Object.assign({}, base, { confianza: confianza });
  }

  const resultado = simularResultado();

  const bloqueResultado = document.getElementById('identificarResultado');
  const bloqueNoEncontrado = document.getElementById('identificarNoEncontrado');

  if (resultado.confianza < UMBRAL_CONFIANZA) {
    if (bloqueResultado) bloqueResultado.style.display = 'none';
    if (bloqueNoEncontrado) bloqueNoEncontrado.style.display = 'block';
    return;
  }

  let especieActual = { nombre: resultado.nombre, cientifico: resultado.cientifico };

  document.getElementById('resPrincipalNombre').textContent = resultado.nombre;
  document.getElementById('resPrincipalCientifico').textContent = resultado.cientifico;
  document.getElementById('confianzaFill').style.width = resultado.confianza + '%';
  document.getElementById('confianzaLabel').textContent = resultado.confianza + '% de confianza (simulada)';

  let restante = 100 - resultado.confianza;
  const grid = document.getElementById('alternativasGrid');
  if (grid) {
    resultado.alternativas.forEach(function (alt, i) {
      const esUltima = i === resultado.alternativas.length - 1;
      const pct = Math.max(1, esUltima ? restante : Math.round(restante * 0.6));
      restante -= pct;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'alternativa-card';
      card.dataset.nombre = alt.nombre;
      card.dataset.cientifico = alt.cientifico;
      card.innerHTML =
        '<span class="alternativa-card__emoji">' + alt.emoji + '</span>' +
        '<span class="alternativa-card__nombre">' + alt.nombre + '</span>' +
        '<span class="alternativa-card__pct">' + pct + '% probabilidad</span>';
      card.addEventListener('click', function () {
        especieActual = { nombre: alt.nombre, cientifico: alt.cientifico };
        document.getElementById('resPrincipalNombre').textContent = especieActual.nombre;
        document.getElementById('resPrincipalCientifico').textContent = especieActual.cientifico;
      });
      grid.appendChild(card);
    });
  }

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
