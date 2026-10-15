'use strict';

// Avoid native vertical restoration landing between horizontally presented chapters.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo({ top: 0, behavior: 'instant' });

// Coordinates show each original page directly, without changing the supplied images.
const pageCrop = (image, x, y, width, height, alt) => ({ image, x, y, width, height, alt });
const spreadCrop = (image, x, y, width, height, leftAlt, rightAlt) => [
  pageCrop(image, x, y, width / 2, height, leftAlt),
  pageCrop(image, x + width / 2, y, width / 2, height, rightAlt)
];
const spreads = [
  { id: 'cover', title: 'Cover', cover: true, pages: [
    pageCrop('04', 86, 75, 342, 442, 'Modeling Portfolio. Jennifer. Poised for the Future. Embracing Elegance with confidence.'),
    pageCrop('04', 471, 75, 341, 442, 'Чёрно-белый портрет Jennifer. Visit more works.')
  ] },
  { id: 'editorial', title: 'Editorial', pages: spreadCrop('01', 223, 51, 367, 235, 'Чёрно-белая fashion съёмка: портрет девушки.', 'Чёрно-белая fashion съёмка: портрет мужчины.') },
  { id: 'about', title: 'About me', pages: spreadCrop('02', 54, 39, 382, 247, 'Jennifer Williams. Fashion model. Портреты и параметры модели.', 'About me. Awards. Experience. Skills. Agency. Contact.') },
  { id: 'content', title: 'Content', pages: spreadCrop('02', 463, 39, 383, 247, 'Content. 03 About me. 07 Classic pose. 11 Lifestyle. 15 Concept shots.', 'Портрет модели у моря в вязаном капюшоне.') },
  { id: 'classic', title: 'Classic pose', pages: spreadCrop('02', 54, 314, 383, 248, 'Classic pose. Модель в светлом комбинезоне.', 'Casual full body shots. Три фотографии в полный рост.') },
  { id: 'commercial', title: 'Commercial shots', pages: spreadCrop('02', 464, 314, 381, 248, 'Крупный beauty портрет модели на светлом фоне.', 'Commercial shots. Три рекламных beauty портрета.') },
  { id: 'lifestyle', title: 'Lifestyle', pages: spreadCrop('03', 597, 219, 251, 162, 'Lifestyle. Портрет модели на берегу моря.', 'Portrait on the beach — one. Три фотографии у моря.') },
  { id: 'beauty', title: 'Portrait on the beach', pages: spreadCrop('03', 52, 403, 252, 162, 'Portrait on the beach — two. Фотографии в белом платье.', 'Крупный портрет модели на пляже.') },
  { id: 'concept', title: 'Concept shots', pages: spreadCrop('03', 325, 403, 251, 162, 'Concept shots. Чёрно-белый портрет в костюме.', 'Concept shots. Be formal. Чёрно-белая fashion съёмка.') },
  { id: 'desert', title: 'Concept shots — desert', pages: spreadCrop('03', 597, 403, 252, 162, 'Concept shots. Be desert. Съёмка в пустыне.', 'Портрет лежащей на песке модели в солнечных очках.') }
];
const filmstrip = document.getElementById('filmstrip');
const story = document.querySelector('.scroll-story');
const root = document.documentElement;
const previous = document.getElementById('previous');
const next = document.getElementById('next');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let spreadWidth = 760;
let stride = 890;
let scrollRange = 1;
let active = -1;
let frame = 0;
const imageDimensions = { '01': [900, 600], '02': [900, 600], '03': [900, 600], '04': [900, 600] };

spreads.forEach((spread, index) => {
  const section = document.createElement('section');
  section.className = `spread${spread.cover ? ' cover' : ''}`;
  section.id = spread.id;
  section.setAttribute('aria-label', `${index + 1}. ${spread.title}`);
  const heading = document.createElement('h1');
  heading.className = 'sr-only';
  heading.textContent = spread.title;
  section.appendChild(heading);
  spread.pages.forEach((crop) => {
    const page = document.createElement('div');
    page.className = 'page';
    const img = document.createElement('img');
    img.src = `assets/${crop.image}.jpg`;
    img.alt = crop.alt;
    img.draggable = false;
    img.decoding = 'async';
    img.loading = index < 2 ? 'eager' : 'lazy';
    const [imageWidth, imageHeight] = imageDimensions[crop.image];
    img.width = imageWidth;
    img.height = imageHeight;
    img.style.width = `${imageWidth / crop.width * 100}%`;
    img.style.height = `${imageHeight / crop.height * 100}%`;
    img.style.left = `${-crop.x / crop.width * 100}%`;
    img.style.top = `${-crop.y / crop.height * 100}%`;
    page.appendChild(img);
    section.appendChild(page);
  });
  if (spread.id === 'content') {
    const links = document.createElement('nav');
    links.className = 'contents-hotspots';
    links.setAttribute('aria-label', 'Главы портфолио');
    [2, 4, 6, 8].forEach((target) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Перейти к ${spreads[target].title}`);
      button.addEventListener('click', () => goTo(target));
      links.appendChild(button);
    });
    section.appendChild(links);
  }
  filmstrip.appendChild(section);
});

function measure() {
  const progress = scrollRange > 1 ? window.scrollY / scrollRange : 0;
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
  document.getElementById('progress-fill').style.width = `${offset / scrollRange * 100}%`;
  const current = Math.max(0, Math.min(spreads.length - 1, Math.round(offset / stride)));
  if (current !== active) {
    active = current;
    document.getElementById('chapter-label').textContent = spreads[current].title;
    document.getElementById('current-page').textContent = String(current + 1).padStart(2, '0');
    previous.disabled = current === 0;
    next.disabled = current === spreads.length - 1;
    document.getElementById('reader-announcement').textContent = `Разворот ${current + 1} из ${spreads.length}: ${spreads[current].title}`;
    Array.from(filmstrip.children).forEach((section, index) => {
      section.inert = index !== current;
      section.setAttribute('aria-hidden', String(index !== current));
    });
  }
}

function goTo(index) {
  const target = Math.max(0, Math.min(spreads.length - 1, index));
  window.scrollTo({ top: target * stride, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}
window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(render); }, { passive: true });
window.addEventListener('resize', measure);
previous.addEventListener('click', () => goTo(active - 1));
next.addEventListener('click', () => goTo(active + 1));
document.querySelector('.contents-button').addEventListener('click', () => goTo(3));
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

// Vertical touch scrolling is native; a horizontal swipe also turns a spread.
let touchStart = null;
filmstrip.addEventListener('touchstart', (event) => {
  if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  else touchStart = null;
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
