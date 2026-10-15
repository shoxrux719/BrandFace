import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {spreads} from './spreads.jsx';
import {wrap} from './carouselMath.js';
import useInfiniteReader from './useInfiniteReader.js';
import useMediaQuery from './useMediaQuery.js';
import IntroFilm from './IntroFilm.jsx';
import MobilePage, {readerUnits, StorySheet} from './MobilePages.jsx';

export default function App() {
  const mobile = useMediaQuery('(max-width: 767px) and (orientation: portrait)');
  const [filmOpen,setFilmOpen] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches && new URLSearchParams(location.search).get('intro')!=='0');
  const [story,setStory] = useState(null);
  const units = useMemo(() => readerUnits(spreads,mobile),[mobile]);
  const scale = mobile ? 2 : 1;
  const reader = useInfiniteReader(units.length,filmOpen || !!story,scale);
  const main = useRef(null);
  const finishFilm = useCallback(() => setFilmOpen(false),[]);
  useEffect(() => {if (!filmOpen && !story) main.current?.focus({preventScroll:true});},[filmOpen,story]);
  useEffect(() => {setStory(null);},[mobile]);
  const chapter = units[reader.active] || units[0];
  const currentSlot = Math.round(reader.position);
  const goToChapter = index => reader.goTo(index*scale);
  const openContents = () => goToChapter(spreads.findIndex(s => s.id==='content'));
  const onChapterClick = event => {
    const button = event.target.closest('[data-go]');
    if (!button || filmOpen || story || reader.dragging) return;
    const index = spreads.findIndex(s => s.id===button.dataset.go);
    if (index>=0) goToChapter(index);
  };
  const covered = filmOpen || !!story;

  return <>
    <a className="skip-link" href="#portfolio" inert={covered}>К портфолио</a>
    <header className="experience-header" inert={covered}>
      <button className="brand-mark" type="button" onClick={() => goToChapter(0)} aria-label="К обложке">JW<span>JENNIFER WILLIAMS</span></button>
      <nav className="experience-menu" aria-label="Главное меню">
        <button type="button" onClick={() => setFilmOpen(true)} className="film-button"><span className="play-symbol" aria-hidden="true">▷</span><span>Film</span></button>
        <button type="button" onClick={openContents} className="contents-button" aria-label="Содержание"><span className="menu-label">Content</span><span className="menu-mark" aria-hidden="true"><i></i><i></i></span></button>
      </nav>
    </header>

    <main id="portfolio" ref={main} className={`reader${mobile ? ' phone-reader' : ''}${reader.dragging ? ' is-dragging' : ''}`} tabIndex={-1}
      aria-label={mobile ? 'Портфолио Jennifer Williams. Листайте влево или вверх.' : 'Портфолио Jennifer Williams. Листайте вниз, чтобы двигаться влево.'}
      inert={covered} onClick={onChapterClick} {...reader.pointerHandlers}>
      {reader.slots.map(slot => {
        const unit = units[wrap(slot,units.length)];
        const isCurrent = slot===currentSlot;
        return <section key={`${scale}-${slot}`} ref={node => reader.register(slot,node)}
          className={`${unit.className} reader-slide${mobile ? ' phone-slide' : ''}${isCurrent ? ' is-current' : ''}`}
          style={{transform:`translate3d(${(slot-reader.position)*innerWidth}px,0,0)`}}
          data-chapter={unit.id} data-part={unit.part} data-slot={slot} inert={!isCurrent} aria-hidden={!isCurrent} aria-label={unit.title}>
          {mobile ? <MobilePage unit={unit} onStory={setStory} /> : unit.content}
        </section>;
      })}
    </main>

    <footer className={`experience-footer${mobile ? ' phone-footer' : ''}`} inert={covered}>
      <div className="chapter-status"><span className="chapter-folio">{String(reader.active+1).padStart(2,'0')}{mobile && <span className="folio-total"> / {units.length}</span>}</span><span className="chapter-label">{chapter.title}</span></div>
      <span className="reading-hint">Листайте вниз <span aria-hidden="true">↓</span></span>
      <nav className="reader-navigation" aria-label="Листать портфолио">
        <button type="button" onClick={() => reader.advance(-1)} aria-label={mobile ? 'Предыдущая страница' : 'Предыдущий разворот'}>←</button>
        <span className="infinity-mark" title="Бесконечная карусель" aria-label="Бесконечная карусель">∞</span>
        <button type="button" onClick={() => reader.advance(1)} aria-label={mobile ? 'Следующая страница' : 'Следующий разворот'}>→</button>
      </nav>
      {mobile && <div className="phone-progress" aria-hidden="true"><i style={{transform:`scaleX(${(reader.active+1)/units.length})`}} /></div>}
    </footer>
    {!mobile && <div className="chapter-indicator" inert={covered}>
      {spreads.map((spread,index) => <button key={spread.id} type="button" onClick={() => goToChapter(index)} aria-label={spread.title} aria-current={index===chapter.chapterIndex ? 'page' : undefined} className={index===chapter.chapterIndex ? 'selected' : ''} />)}
    </div>}
    <p className="sr-only" aria-live="polite" aria-atomic="true">{mobile ? 'Страница' : 'Разворот'} {reader.active+1} из {units.length}: {chapter.title}.</p>
    {story && <StorySheet unit={story} onClose={() => setStory(null)} />}
    {filmOpen && <IntroFilm onDone={finishFilm} />}
  </>;
}
