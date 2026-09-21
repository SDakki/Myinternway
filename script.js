const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('navMenu');
const hamburger = document.getElementById('hamburger');

const revealElements = document.querySelectorAll('.reveal-on-scroll');
const storyTrack = document.getElementById('storyTrack');
const storyViewport = document.querySelector('.story-viewport');
const storyCurrent = document.getElementById('storyCurrent');
const storyDots = [...document.querySelectorAll('.carousel-dot')];
const storySlides = [...document.querySelectorAll('.story-slide')];
const storyPrev = document.getElementById('storyPrev');
const storyNext = document.getElementById('storyNext');
let storyIndex = 0;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setupMotion() {
  if (reducedMotion) return;

  if (window.Lenis) {
    const lenis = new Lenis({ autoRaf: true, anchors: true, smoothWheel: true });
    window.myInternWayLenis = lenis;
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-header > *, .hero-footer > *', { opacity: 0, y: 24, duration: .8, stagger: .08, ease: 'power3.out', delay: .15 });
    gsap.from('.hero-collage', { opacity: 0, scale: .94, rotate: 6, duration: 1.1, ease: 'power3.out', delay: .3 });
    gsap.utils.toArray('.section-heading, .about-grid, .destination-grid, .process-section, .access-section').forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 42,
        duration: .85,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      });
    });
    gsap.to('.hero:after', { y: 80, rotation: 18, ease: 'none', scrollTrigger: { trigger: '.hero', scrub: true } });
  }

  if (window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll('.destination-card, .floating-note'), {
      max: 5,
      speed: 500,
      perspective: 900,
      glare: true,
      'max-glare': .12,
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupMotion, { once: true });
} else {
  setupMotion();
}

function closeMenu() {
  navMenu.classList.remove('active');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', window.myinternwayI18n ? window.myinternwayI18n.t('nav_aria_open') : 'Open menu');
}

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('active');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  const openLabel = window.myinternwayI18n ? window.myinternwayI18n.t('nav_aria_open') : 'Open menu';
  const closeLabel = window.myinternwayI18n ? window.myinternwayI18n.t('nav_aria_close') : 'Close menu';
  hamburger.setAttribute('aria-label', isOpen ? closeLabel : openLabel);
});

navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  navbar.classList.toggle('nav-hidden', currentScrollY > lastScrollY && currentScrollY > 100);
  lastScrollY = currentScrollY;
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

function showStory(index) {
  storyIndex = (index + storySlides.length) % storySlides.length;
  storyTrack.style.transform = `translateX(-${storyIndex * 100}%)`;
  storyCurrent.textContent = String(storyIndex + 1).padStart(2, '0');
  storyDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === storyIndex;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
}

function moveStory(direction) {
  showStory(storyIndex + direction);
}

storyPrev.addEventListener('click', (event) => {
  event.stopPropagation();
  moveStory(-1);
});
storyNext.addEventListener('click', (event) => {
  event.stopPropagation();
  moveStory(1);
});
storyDots.forEach((dot, index) => dot.addEventListener('click', () => showStory(index)));

let pointerStartX = 0;
storyViewport.addEventListener('pointerdown', (event) => {
  if (event.target.closest('.carousel-side-button')) return;
  pointerStartX = event.clientX;
  storyViewport.classList.add('is-dragging');
  storyViewport.setPointerCapture(event.pointerId);
});
storyViewport.addEventListener('pointerup', (event) => {
  if (event.target.closest('.carousel-side-button')) return;
  const distance = event.clientX - pointerStartX;
  storyViewport.classList.remove('is-dragging');
  if (Math.abs(distance) < 45) return;
  showStory(storyIndex + (distance < 0 ? 1 : -1));
});
storyViewport.addEventListener('pointercancel', () => storyViewport.classList.remove('is-dragging'));
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') moveStory(-1);
  if (event.key === 'ArrowRight') moveStory(1);
});
