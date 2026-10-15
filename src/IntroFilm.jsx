import React, {useCallback, useEffect, useRef, useState} from 'react';
import useMediaQuery from './useMediaQuery.js';

export default function IntroFilm({onDone}) {
  const video = useRef(null);
  const skip = useRef(null);
  const finishTimer = useRef(null);
  const resumeAt = useRef(0);
  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(true);
  const [needsPlay, setNeedsPlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const portrait = useMediaQuery('(orientation: portrait)');
  const source = `${import.meta.env.BASE_URL}assets/intro/portfolio-intro${portrait ? '-mobile' : ''}.mp4${portrait ? '?edition=2' : ''}`;
  const leave = useCallback(() => {
    if (finishTimer.current) return;
    setLeaving(true);
    finishTimer.current = setTimeout(onDone, 550);
  }, [onDone]);

  useEffect(() => {
    skip.current?.focus({preventScroll: true});
    const onKey = event => {if (event.key === 'Escape') leave();};
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(finishTimer.current);
      finishTimer.current = null;
    };
  }, [leave]);

  // Keep the same moment when rotating the phone, instead of restarting the film.
  useEffect(() => {
    setNeedsPlay(false);
    let alive = true;
    video.current?.play().catch(() => {if (alive) setNeedsPlay(true);});
    return () => {alive = false;};
  }, [source]);

  const play = () => video.current?.play().then(() => setNeedsPlay(false)).catch(() => setNeedsPlay(true));
  const toggleSound = () => {
    if (!video.current) return;
    video.current.muted = !muted;
    setMuted(!muted);
    play();
  };

  return <section className={`intro-film${portrait ? ' intro-portrait' : ''}${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="Вступительный фильм Jennifer Williams">
    <video ref={video} className="intro-video" autoPlay muted={muted} playsInline preload="auto"
      src={source}
      poster={`${import.meta.env.BASE_URL}assets/intro/poster${portrait ? '-portrait' : ''}.jpg${portrait ? '?edition=2' : ''}`}
      onLoadedMetadata={event => {
        const player = event.currentTarget;
        player.currentTime = Math.min(resumeAt.current, Math.max(0, player.duration - .1));
      }}
      onPlaying={() => setNeedsPlay(false)} onEnded={leave} onError={() => setNeedsPlay(true)}
      onTimeUpdate={event => {
        const player = event.currentTarget;
        // A new source briefly reports zero before metadata is available.
        if (player.readyState < 1) return;
        resumeAt.current = player.currentTime;
        setProgress(player.duration ? player.currentTime / player.duration : 0);
      }}
      aria-label="Кинематографическое вступление: портреты и анимированная типографика">
      Ваш браузер не поддерживает видео.
    </video>
    <div className="intro-topline"><span>JENNIFER WILLIAMS</span><span>A PORTFOLIO IN MOTION</span></div>
    {needsPlay && <button className="intro-play" onClick={play} type="button" aria-label="Воспроизвести вступление">▷<span>Воспроизвести</span></button>}
    <div className="intro-bottomline"><button onClick={toggleSound} type="button" aria-pressed={!muted} className="sound-button">{muted ? 'Звук выключен' : 'Звук включён'}<span aria-hidden="true">{muted ? '○' : '◉'}</span></button><span className="intro-caption">FASHION. PRESENCE. EXPRESSION.</span><button ref={skip} className="intro-skip" type="button" onClick={leave}>К портфолио <span aria-hidden="true">↗</span></button></div>
    <div className="intro-progress" aria-hidden="true"><i style={{transform: `scaleX(${progress})`}} /></div>
  </section>;
}
