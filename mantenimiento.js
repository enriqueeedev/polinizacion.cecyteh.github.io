/**
 * ================================================================
 *  POLINIZACIÓN CECYTEH — mantenimiento.js
 *  Contador regresivo, barra de progreso y animaciones de entrada.
 * ================================================================
 */

'use strict';

/* ----------------------------------------------------------------
   ✅ CAMBIA LA FECHA AQUÍ:
   Formato: año, mes (0=enero, 11=diciembre), día, hora, minuto
   Ejemplo actual: 15 de junio de 2025, a las 12:00
   ---------------------------------------------------------------- */
const FECHA_OBJETIVO = new Date(2025, 5, 15, 12, 0, 0);
/* ---------------------------------------------------------------- */

/* ✅ Cambia el porcentaje de progreso (0 a 100) */
const PROGRESO = 65;


/* ----------------------------------------------------------------
   ANIMACIONES DE ENTRADA
   ---------------------------------------------------------------- */
function initReveal() {
  const elements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.05 }
  );

  elements.forEach(el => observer.observe(el));
}


/* ----------------------------------------------------------------
   BARRA DE PROGRESO ANIMADA
   ---------------------------------------------------------------- */
function initProgress() {
  const fill = document.getElementById('progressFill');
  const bee  = document.querySelector('.progress-bee');
  const pct  = document.getElementById('progressPct');
  if (!fill || !bee || !pct) return;

  // Animar después de 800ms para que se vea el efecto
  setTimeout(() => {
    const val = Math.min(100, Math.max(0, PROGRESO));
    fill.style.width = `${val}%`;
    bee.style.left   = `${val}%`;
    pct.textContent  = `${val}%`;
    fill.closest('[role="progressbar"]')?.setAttribute('aria-valuenow', val);
  }, 800);
}


/* ----------------------------------------------------------------
   CONTADOR REGRESIVO
   ---------------------------------------------------------------- */
function initCountdown() {
  const elDias    = document.getElementById('cDias');
  const elHoras   = document.getElementById('cHoras');
  const elMinutos = document.getElementById('cMinutos');
  const elSegundos = document.getElementById('cSegundos');

  if (!elDias || !elHoras || !elMinutos || !elSegundos) return;

  function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function animateFlip(el, newVal) {
    if (el.textContent === newVal) return;
    el.classList.remove('flip');
    void el.offsetWidth; // reflow para reiniciar animación
    el.textContent = newVal;
    el.classList.add('flip');
    setTimeout(() => el.classList.remove('flip'), 350);
  }

  function update() {
    const ahora  = new Date();
    const diff   = FECHA_OBJETIVO - ahora;

    if (diff <= 0) {
      // Ya llegó la fecha — mostrar ceros
      [elDias, elHoras, elMinutos, elSegundos].forEach(el => {
        animateFlip(el, '00');
      });
      return;
    }

    const dias    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segs    = Math.floor((diff % (1000 * 60)) / 1000);

    animateFlip(elDias,     pad(dias));
    animateFlip(elHoras,    pad(horas));
    animateFlip(elMinutos,  pad(minutos));
    animateFlip(elSegundos, pad(segs));
  }

  update();
  setInterval(update, 1000);
}


/* ----------------------------------------------------------------
   INICIO
   ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initProgress();
  initCountdown();

  console.log(
    '%c🐝 Polinización Cecyteh · Página en mantenimiento',
    'color: #f5a623; font-size: 14px; font-weight: bold;'
  );
});
