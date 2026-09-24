document.addEventListener('DOMContentLoaded', function () {

  var navbar = document.querySelector('.navbar');
  var toggle = document.querySelector('.navbar__toggle');
  var mobileMenu = document.querySelector('.navbar__mobile');

  if (navbar) {
    function onScroll() { navbar.classList.toggle('scrolled', window.scrollY > 10); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var isOpen = toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
      }
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link, .navbar__mobile-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  if (!('IntersectionObserver' in window)) return;
  var targets = document.querySelectorAll(
    '.feature-card, .benefit-item, .hero__content, .hero__image-wrap, .cta-section__content'
  );
  // ease-out fuerte: el elemento arranca rapido y se asienta suave
  var EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
  targets.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
  });
  var observer = new IntersectionObserver(function (entries) {
    // El escalonado es solo entre los elementos que entran juntos en pantalla.
    // Con el indice global, lo que esta al final de la pagina esperaba mas de
    // un segundo despues de hacerse visible.
    var orden = 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var retraso = (orden++ * 0.07) + 's';
      el.style.transition = 'opacity 0.5s ' + EASE_OUT + ' ' + retraso + ', transform 0.5s ' + EASE_OUT + ' ' + retraso;
      // Vaciar (en vez de fijar opacity:1 / translateY(0)) devuelve el control a
      // la hoja de estilos: un transform en linea anulaba el :hover de las tarjetas.
      el.style.opacity = '';
      el.style.transform = '';
      el.addEventListener('transitionend', function limpiar(e) {
        if (e.target !== el || e.propertyName !== 'opacity') return;
        // Sin esto, el hover heredaba la transicion de 0.5s con retraso
        el.style.transition = '';
        el.removeEventListener('transitionend', limpiar);
      });
      observer.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(function (el) { observer.observe(el); });
});
