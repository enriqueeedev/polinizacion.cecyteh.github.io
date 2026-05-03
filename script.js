'use strict';

/* ----------------------------------------------------------------
   1. ESPERAR A QUE EL DOM ESTÉ LISTO
   ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTheme();
  initScrollReveal();
  initGallery();
  initAudioButtons();
  initBgMusic();
  initScrollTop();
  initMobileMenu();
  initActiveNavLink();
});


/* ----------------------------------------------------------------
   2. NAVBAR: efecto scroll + transparencia + blur
   ---------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); 
}


/* ----------------------------------------------------------------
   3. MODO OSCURO / CLARO
   ---------------------------------------------------------------- */
function initTheme() {
  const btn  = document.getElementById('btnTheme');
  const html = document.documentElement;
  const KEY  = 'jardin-theme'; 

 
  const saved = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = saved || (prefersDark ? 'dark' : 'light');
  html.setAttribute('data-theme', initialTheme);

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem(KEY, next);
  });
}


/* ----------------------------------------------------------------
   4. SCROLL REVEAL 
   ---------------------------------------------------------------- */
function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); 
        }
      });
    },
    {
      threshold: 0.12,  
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));
}


/* ----------------------------------------------------------------
   5. GALERÍA CON LIGHTBOX
   ---------------------------------------------------------------- */
function initGallery() {
  const items    = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightboxImg');
  const lbCap    = document.getElementById('lightboxCaption');
  const lbClose  = document.getElementById('lightboxClose');
  const lbPrev   = document.getElementById('lightboxPrev');
  const lbNext   = document.getElementById('lightboxNext');

  if (!items.length || !lightbox) return;

  
  let galleryData = [];
  let currentIndex = 0;

  items.forEach((item, idx) => {
    const img = item.querySelector('img');
    galleryData.push({
      src: img ? img.src : '',
      alt: img ? img.alt : '',
      caption: item.getAttribute('data-caption') || ''
    });

    item.addEventListener('click', () => openLightbox(idx));
    
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  function openLightbox(idx) {
    currentIndex = idx;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    items[currentIndex]?.focus();
  }

  function updateLightbox() {
    const data = galleryData[currentIndex];
    if (!data) return;
    lbImg.src     = data.src;
    lbImg.alt     = data.alt;
    lbCap.textContent = data.caption;
    
    const hasMany = galleryData.length > 1;
    lbPrev.style.display = hasMany ? '' : 'none';
    lbNext.style.display = hasMany ? '' : 'none';
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + galleryData.length) % galleryData.length;
    
    lbImg.style.opacity = '0';
    setTimeout(() => {
      updateLightbox();
      lbImg.style.opacity = '1';
    }, 150);
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click', () => navigate(1));

  
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   navigate(-1);
    if (e.key === 'ArrowRight')  navigate(1);
  });

  
  lbImg.style.transition = 'opacity 150ms ease';
}


/* ----------------------------------------------------------------
   6. BOTONES DE AUDIO POR SECCIÓN
   ---------------------------------------------------------------- */
function initAudioButtons() {
  const buttons = document.querySelectorAll('.btn-audio');
  let currentAudio = null; // audio actualmente en reproducción
  let currentBtn   = null;

  buttons.forEach(btn => {
    
    const src = btn.getAttribute('data-src');
    if (!src) return;

    btn.addEventListener('click', () => {
      
      if (currentBtn === btn && currentAudio) {
        if (currentAudio.paused) {
          currentAudio.play().catch(console.warn);
          btn.classList.add('playing');
          updateBtnText(btn, true);
        } else {
          currentAudio.pause();
          btn.classList.remove('playing');
          updateBtnText(btn, false);
        }
        return;
      }

      
      if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentBtn?.classList.remove('playing');
        if (currentBtn) updateBtnText(currentBtn, false);
      }

      
      const audio = new Audio(src);

      audio.addEventListener('ended', () => {
        btn.classList.remove('playing');
        updateBtnText(btn, false);
        currentAudio = null;
        currentBtn   = null;
      });

      audio.addEventListener('error', () => {
        console.warn(`No se pudo cargar el audio: ${src}`);
        btn.classList.remove('playing');
        showAudioError(btn);
      });

      audio.play()
        .then(() => {
          btn.classList.add('playing');
          updateBtnText(btn, true);
          currentAudio = audio;
          currentBtn   = btn;
        })
        .catch(err => {
          console.warn('No se pudo reproducir el audio:', err);
        });
    });
  });

  /**
   * Actualiza el texto del botón según estado
   */
  function updateBtnText(btn, playing) {
    const svg = btn.querySelector('svg');
    btn.textContent = playing ? 'Pausar audio' : btn.getAttribute('data-original-text') || 'Reproducir';
    if (svg) btn.prepend(svg);
  }

  
  buttons.forEach(btn => {
 
    const clone = btn.cloneNode(true);
    clone.querySelector('svg')?.remove();
    btn.setAttribute('data-original-text', clone.textContent.trim());
  });

  function showAudioError(btn) {
    const svg = btn.querySelector('svg');
    btn.textContent = '⚠ Audio no disponible';
    if (svg) btn.prepend(svg);
    btn.style.opacity = '0.6';
    setTimeout(() => {
      const origText = btn.getAttribute('data-original-text') || 'Reproducir';
      btn.textContent = origText;
      if (svg) btn.prepend(svg);
      btn.style.opacity = '';
    }, 3000);
  }
}


/* ----------------------------------------------------------------
   7. MÚSICA DE FONDO
   ---------------------------------------------------------------- */
function initBgMusic() {
  const btn   = document.getElementById('btnMusic');
  const audio = document.getElementById('bgMusic');
  if (!btn || !audio) return;

  let isPlaying = false;

  btn.addEventListener('click', async () => {
    if (!isPlaying) {
      try {
        await audio.play();
        isPlaying = true;
        btn.classList.add('playing');
        btn.setAttribute('title', 'Pausar música');
        // Fade in suave
        audio.volume = 0;
        fadeAudio(audio, 0, 0.35, 1500); // fade hasta volumen 35%
      } catch (err) {
        console.warn('No se pudo reproducir la música:', err);
      }
    } else {
      fadeAudio(audio, audio.volume, 0, 800, () => {
        audio.pause();
        isPlaying = false;
        btn.classList.remove('playing');
        btn.setAttribute('title', 'Reproducir música de fondo');
      });
    }
  });

  /**
   * Fade de volumen gradual
   * @param {HTMLAudioElement} audioEl
   * @param {number} from  volumen inicial (0-1)
   * @param {number} to    volumen final (0-1)
   * @param {number} ms    duración en ms
   * @param {Function} [cb] callback al terminar
   */
  function fadeAudio(audioEl, from, to, ms, cb) {
    const steps    = 30;
    const interval = ms / steps;
    const delta    = (to - from) / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      audioEl.volume = Math.min(1, Math.max(0, from + delta * step));
      if (step >= steps) {
        clearInterval(timer);
        audioEl.volume = to;
        if (cb) cb();
      }
    }, interval);
  }
}


/* ----------------------------------------------------------------
   8. BOTÓN VOLVER ARRIBA
   ---------------------------------------------------------------- */
function initScrollTop() {
  const btn = document.getElementById('btnTop');
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ----------------------------------------------------------------
   9. MENÚ HAMBURGUESA (MÓVIL)
   ---------------------------------------------------------------- */
function initMobileMenu() {
  const btnHamburger = document.getElementById('btnHamburger');
  const navLinks     = document.getElementById('navLinks');
  const overlay      = document.getElementById('navOverlay');
  if (!btnHamburger || !navLinks) return;

  function openMenu() {
    navLinks.classList.add('open');
    btnHamburger.classList.add('open');
    overlay?.classList.add('active');
    btnHamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    btnHamburger.classList.remove('open');
    overlay?.classList.remove('active');
    btnHamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btnHamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Cerrar al hacer click en un link
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar al hacer click en el overlay
  overlay?.addEventListener('click', closeMenu);

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}


/* ----------------------------------------------------------------
   10. RESALTADO DE LINK ACTIVO EN NAVBAR AL HACER SCROLL
   ---------------------------------------------------------------- */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${id}`);
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0
    }
  );

  sections.forEach(section => observer.observe(section));
}


/* ----------------------------------------------------------------
   11. SMOOTH SCROLL
   ---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const navbarHeight = document.getElementById('navbar')?.offsetHeight || 70;
    const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ----------------------------------------------------------------
   12. UTILIDAD: LAZY LOADING DE IMÁGENES
   ---------------------------------------------------------------- */
function initLazyImages() {
  if ('loading' in HTMLImageElement.prototype) return; // soporte nativo

  const images = document.querySelectorAll('img[loading="lazy"]');
  const imgObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        imgObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imgObserver.observe(img));
}

initLazyImages();


/* ----------------------------------------------------------------
   13. EFECTO PARALLAX SUTIL EN EL HERO
   ---------------------------------------------------------------- */
const heroSection = document.querySelector('.hero');
if (heroSection) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroSection.style.backgroundPositionY = `calc(center + ${scrollY * 0.3}px)`;
  }, { passive: true });
}


/* ----------------------------------------------------------------
   14. CONSOLE CREDITS
   ---------------------------------------------------------------- */
console.log(
  '%c🌿 El Jardín que Da Vida%c\nProyecto escolar 2026\nCreada Por Enrique Dev.',
  'color: #4a8f3f; font-size: 18px; font-weight: bold; font-family: serif;',
  'color: #6ab04c; font-size: 12px;'
);