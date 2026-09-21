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
    gsap.utils.toArray('.section-heading, .about-grid, .roles-section, .process-section').forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 35,
        duration: .7,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      });
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
let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      navbar.classList.toggle('nav-hidden', currentScrollY > lastScrollY && currentScrollY > 100);
      lastScrollY = currentScrollY;
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

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

// Modales de Estudiante, Empresa, Login y Dashboard
const studentModal = document.getElementById('studentModal');
const companyModal = document.getElementById('companyModal');
const loginModal = document.getElementById('loginModal');
const dashboardModal = document.getElementById('dashboardModal');

const openStudentBtn = document.getElementById('openStudentModal');
const openCompanyBtn = document.getElementById('openCompanyModal');
const navLoginBtn = document.getElementById('navLoginBtn');

const switchToLoginBtn = document.getElementById('switchToLoginBtn');
const switchToSignupBtn = document.getElementById('switchToSignupBtn');

function openModal(modal) {
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  const firstInput = modal.querySelector('input, button, textarea');
  if (firstInput) firstInput.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}

window.openModal = openModal;
window.closeModal = closeModal;

openStudentBtn?.addEventListener('click', () => openModal(studentModal));
openCompanyBtn?.addEventListener('click', () => openModal(companyModal));

navLoginBtn?.addEventListener('click', async () => {
  let session = window._currentSession || null;
  if (!session && window.supabaseClient) {
    try {
      const res = await window.supabaseClient.auth.getSession();
      session = res.data?.session;
    } catch (e) {
      console.error(e);
    }
  }

  const isUserActive = navLoginBtn.classList.contains('nav-user-active');

  if ((session && session.user) || isUserActive) {
    if (typeof window.checkUserSession === 'function') {
      await window.checkUserSession(session);
    }
    openModal(dashboardModal);
  } else {
    // Si no hay sesión iniciada, abrir login
    openModal(loginModal);
  }
});

switchToLoginBtn?.addEventListener('click', () => {
  closeModal(studentModal);
  openModal(loginModal);
});

switchToSignupBtn?.addEventListener('click', () => {
  closeModal(loginModal);
  openModal(studentModal);
});

document.querySelectorAll('[data-close-modal]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal-backdrop');
    closeModal(modal);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal(studentModal);
    closeModal(companyModal);
    closeModal(loginModal);
    closeModal(dashboardModal);
  }
});

// Gestión de formulario Empresa
const companyModalForm = document.getElementById('companyModalForm');
const companyModalMsg = document.getElementById('companyModalMsg');
const companyModalSubmit = document.getElementById('companyModalSubmit');

companyModalForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (companyModalSubmit) companyModalSubmit.disabled = true;
  if (companyModalMsg) {
    companyModalMsg.textContent = window.myinternwayI18n ? window.myinternwayI18n.t('msg_creating') : 'Enviando...';
    companyModalMsg.classList.remove('is-error');
  }

  const formData = new FormData(companyModalForm);
  const payload = {
    contacto_nombre: formData.get('contacto_nombre')?.toString().trim(),
    empresa_nombre: formData.get('empresa_nombre')?.toString().trim(),
    email: formData.get('email')?.toString().trim(),
    telefono: formData.get('telefono')?.toString().trim(),
    ciudad_sector: formData.get('ciudad_sector')?.toString().trim(),
    necesidades: formData.get('necesidades')?.toString().trim(),
    created_at: new Date().toISOString()
  };

  try {
    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('leads_empresas').insert([payload]);
      if (error) {
        console.warn('Supabase leads_empresas fallback:', error.message);
      }
    }
    if (companyModalMsg) {
      companyModalMsg.textContent = window.myinternwayI18n ? window.myinternwayI18n.t('msg_company_success') : '¡Gracias! Nos pondremos en contacto pronto.';
      companyModalMsg.classList.remove('is-error');
    }
    companyModalForm.reset();
    setTimeout(() => {
      closeModal(companyModal);
      if (companyModalMsg) companyModalMsg.textContent = '';
    }, 2800);
  } catch (err) {
    if (companyModalMsg) {
      companyModalMsg.textContent = err.message || (window.myinternwayI18n ? window.myinternwayI18n.t('msg_error_default') : 'Error al enviar');
      companyModalMsg.classList.add('is-error');
    }
  } finally {
    if (companyModalSubmit) companyModalSubmit.disabled = false;
  }
});
