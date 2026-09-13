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

function closeMenu() {
  navMenu.classList.remove('active');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Abrir menú');
}

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('active');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
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
