/**
 * catalogo.js
 * FaunaScan Perú — Catálogo de especies (US46, US47, US61).
 *
 * Antes: buscar/filtrar por estado ya funcionaba, pero las tarjetas
 * tenían cursor:pointer y una animación de hover sin ningún click
 * handler detrás (--radius-lg/--shadow-md quedaban definidos en el CSS
 * sin usarse en ningún lado, señal de que el detalle quedó a medias).
 * Ahora cada tarjeta abre un modal con el detalle real de la especie y
 * un acceso directo a "Registrar avistamiento" (US47: "tener
 * conocimiento previo al momento de registrar un avistamiento"),
 * reutilizando exactamente la misma clave de localStorage
 * (faunaEspecieRegistro) que ya usan seleccionar-especie.js e
 * identificar-ia.js para pre-cargar la especie en registrar.html.
 *
 * US61 (exclusiva investigador): filtra el catálogo por la
 * especialidad taxonómica configurada en el perfil del usuario
 * (perfil.html -> localStorage "faunaUser".especialidad). Si el
 * investigador no configuró ninguna especialidad todavía, se muestra
 * un aviso real en vez de un filtro que no haría nada.
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

  const FAMILIA_LABEL = { mamifero: 'Mamífero', ave: 'Ave', reptil: 'Reptil' };

  const usuario = JSON.parse(localStorage.getItem('faunaUser') || 'null');
  const esInvestigador = !!usuario && usuario.rol === 'investigador';

  const searchInput = document.getElementById('catalogoSearch');
  const estadoSelect = document.getElementById('filtroEstado');
  const cards = document.querySelectorAll('.especie-card');
  const catalogoEmpty = document.getElementById('catalogoEmpty');

  // --- US61: filtro por especialidad (solo investigador) ---
  const especialidadFiltro = document.getElementById('especialidadFiltro');
  const especialidadHint = document.getElementById('especialidadHint');
  const chkSoloEspecialidad = document.getElementById('chkSoloEspecialidad');
  const especialidadNombre = document.getElementById('especialidadNombre');

  if (esInvestigador && usuario.especialidad) {
    especialidadFiltro.style.display = 'flex';
    especialidadNombre.textContent = FAMILIA_LABEL[usuario.especialidad] || usuario.especialidad;
  } else if (esInvestigador) {
    especialidadHint.style.display = 'block';
  }

  function filter() {
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const est = estadoSelect ? estadoSelect.value : '';
    const soloEspecialidad = esInvestigador && chkSoloEspecialidad && chkSoloEspecialidad.checked && usuario.especialidad;
    let visibles = 0;
    cards.forEach(function (card) {
      const nombre = (card.dataset.nombre || '').toLowerCase();
      const cardEst = card.dataset.estado || '';
      const cardFamilia = card.dataset.familia || '';
      const matchNombre = !q || nombre.includes(q);
      const matchEst = !est || cardEst === est;
      const matchEspecialidad = !soloEspecialidad || cardFamilia === usuario.especialidad;
      const visible = matchNombre && matchEst && matchEspecialidad;
      card.classList.toggle('hidden', !visible);
      if (visible) visibles++;
    });
    if (catalogoEmpty) catalogoEmpty.style.display = visibles === 0 ? 'block' : 'none';
  }

  searchInput && searchInput.addEventListener('input', filter);
  estadoSelect && estadoSelect.addEventListener('change', filter);
  chkSoloEspecialidad && chkSoloEspecialidad.addEventListener('change', filter);

  // --- Modal de detalle + acceso directo a "Registrar avistamiento" ---
  const modal = document.getElementById('modalEspecie');
  const modalImg = document.getElementById('modalEspecieImg');
  const modalNombre = document.getElementById('modalEspecieNombre');
  const modalCientifico = document.getElementById('modalEspecieCientifico');
  const modalEstado = document.getElementById('modalEspecieEstado');
  const modalFamilia = document.getElementById('modalEspecieFamilia');
  const btnRegistrar = document.getElementById('btnRegistrarDesdeModal');
  const btnCerrarModal = document.getElementById('btnCerrarModalEspecie');
  let especieSeleccionada = null;

  const ESTADO_BADGE_CLASS = { critico: 'badge-red', vulnerable: 'badge-yellow', casi: 'badge-blue', menor: 'badge-green' };

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      const imgSrc = card.querySelector('img') ? card.querySelector('img').src : '';
      especieSeleccionada = {
        nombre: card.dataset.nombre,
        cientifico: card.dataset.cientifico,
        estado: card.dataset.estadoLabel,
        emoji: card.dataset.emoji
      };
      modalImg.src = imgSrc;
      modalImg.alt = card.dataset.nombre;
      modalNombre.textContent = card.dataset.nombre;
      modalCientifico.textContent = card.dataset.cientifico;
      modalEstado.textContent = card.dataset.estadoLabel;
      modalEstado.className = 'badge ' + (ESTADO_BADGE_CLASS[card.dataset.estado] || 'badge-green');
      modalFamilia.textContent = FAMILIA_LABEL[card.dataset.familia] || card.dataset.familia;
      modal.classList.add('open');
    });
  });

  if (btnCerrarModal && modal) {
    btnCerrarModal.addEventListener('click', function () { modal.classList.remove('open'); });
  }
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.classList.remove('open');
    });
  }
  if (btnRegistrar) {
    btnRegistrar.addEventListener('click', function () {
      if (!especieSeleccionada) return;
      localStorage.setItem('faunaEspecieRegistro', JSON.stringify(especieSeleccionada));
      window.location.href = 'registrar.html';
    });
  }
});
