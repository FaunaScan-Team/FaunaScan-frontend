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
  targets.forEach(function (el, i) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease ' + (i * 0.07) + 's, transform 0.5s ease ' + (i * 0.07) + 's';
  });
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(function (el) { observer.observe(el); });
});
