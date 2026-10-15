'use strict';
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo({ top: 0, behavior: 'instant' });
const filmstrip = document.getElementById('filmstrip');
const story = document.querySelector('.scroll-story');
const root = document.documentElement;
const spreads = Array.from(filmstrip.querySelectorAll('.spread'));
const previous = document.getElementById('previous');
const next = document.getElementById('next');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let spreadWidth = 760;
let stride = 890;
let scrollRange = 0;
let active = -1;
let frame = 0;

// Every title, caption and layout is HTML. Only the photographs are raster assets.
// Each photo-only contact sheet has four photographs, sampled independently by CSS.
document.querySelectorAll('.photo-cell').forEach((figure) => {
  const cell = Number(figure.dataset.cell);
  const image = document.createElement('img');
  image.src = `assets/generated/${figure.dataset.photo}.png`;
  image.alt = '';
  image.draggable = false;
  image.decoding = 'async';
  const splitY = figure.dataset.photo === 'classic' ? 679 : 724;
  const cropY = cell > 1 ? splitY + 1 : 0;
  const cropHeight = cell > 1 ? 1448 - cropY : splitY - 1;
  const ratio = 543 / cropHeight;
  figure.style.setProperty('--photo-width', `${ratio * 100}cqh`);
  figure.style.setProperty('--photo-height', `${100 / ratio}cqw`);
  image.style.width = '200%';
  image.style.height = `${1448 / cropHeight * 100}%`;
  image.style.left = cell % 2 ? '-100%' : '0';
  image.style.top = `${-cropY / cropHeight * 100}%`;
  const tile = document.createElement('div');
  tile.className = 'photo-tile';
  tile.appendChild(image);
  figure.appendChild(tile);
});

function measure() {
  const progress = scrollRange > 0 ? Math.min(1, window.scrollY / scrollRange) : 0;
  const height = window.innerHeight;
  spreadWidth = Math.min(window.innerWidth * .84, Math.max(140, height - 178) * (382 / 247));
  const spreadHeight = spreadWidth / (382 / 247);
  const gap = Math.max(46, window.innerWidth * .14);
  stride = spreadWidth + gap;
  scrollRange = stride * (spreads.length - 1);
  root.style.setProperty('--spread-width', `${spreadWidth}px`);
  root.style.setProperty('--spread-height', `${spreadHeight}px`);
  root.style.setProperty('--spread-gap', `${gap}px`);
  story.style.height = `${scrollRange + height}px`;
  if (progress > 0) window.scrollTo({ top: progress * scrollRange, behavior: 'instant' });
  render();
}
function render() {
  frame = 0;
  const offset = Math.max(0, Math.min(window.scrollY, scrollRange));
  filmstrip.style.transform = `translate3d(${-spreadWidth / 2 - offset}px, -50%, 0)`;
  document.getElementById('progress-fill').style.width = `${scrollRange ? offset / scrollRange * 100 : 0}%`;
  const current = Math.max(0, Math.min(spreads.length - 1, Math.round(offset / stride)));
  if (current !== active) {
    active = current;
    document.getElementById('chapter-label').textContent = spreads[current].dataset.title;
    document.getElementById('current-page').textContent = String(current + 1).padStart(2, '0');
    previous.disabled = current === 0;
    next.disabled = current === spreads.length - 1;
    document.getElementById('reader-announcement').textContent = `Разворот ${current + 1} из ${spreads.length}: ${spreads[current].dataset.title}`;
    spreads.forEach((section, index) => {
      section.inert = index !== current;
      section.setAttribute('aria-hidden', String(index !== current));
    });
  }
}
function goTo(index) {
  const target = Math.max(0, Math.min(spreads.length - 1, index));
  window.scrollTo({ top: target * stride, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}
function goToId(id) {
  const index = spreads.findIndex((spread) => spread.id === id);
  if (index >= 0) goTo(index);
}
window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(render); }, { passive: true });
window.addEventListener('resize', measure);
previous.addEventListener('click', () => goTo(active - 1));
next.addEventListener('click', () => goTo(active + 1));
document.querySelector('.contents-button').addEventListener('click', () => goToId('content'));
document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => goToId(button.dataset.go)));
document.querySelector('.wordmark').addEventListener('click', (event) => { event.preventDefault(); goTo(0); });
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    goTo(active + (event.key === 'ArrowRight' ? 1 : -1));
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    goTo(event.key === 'Home' ? 0 : spreads.length - 1);
  }
});
let touchStart = null;
filmstrip.addEventListener('touchstart', (event) => {
  touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
}, { passive: true });
filmstrip.addEventListener('touchend', (event) => {
  if (!touchStart || !event.changedTouches.length) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(active + (dx < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });
document.getElementById('total-pages').textContent = String(spreads.length).padStart(2, '0');
measure();
if (location.hash) {
  const index = spreads.findIndex((spread) => `#${spread.id}` === location.hash);
  if (index >= 0) window.scrollTo({ top: index * stride, behavior: 'instant' });
}
