import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {forwardDestination, gestureDestination, remapReaderPosition, visibleSlots, wrap} from './carouselMath.js';

export default function useInfiniteReader(count, paused, scale = 1) {
  const queryChapter = Number(new URLSearchParams(location.search).get('chapter') || 0);
  const initial = Number.isFinite(queryChapter) ? wrap(Math.round(queryChapter) * scale, count) : 0;
  const motion = useRef({position:initial, target:initial, width:innerWidth, origin:initial, direction:1, wheelActive:false, dragging:false});
  const nodes = useRef(new Map());
  const [view, setView] = useState({base:Math.floor(initial), active:wrap(Math.round(initial), count)});
  const viewRef = useRef(view);
  const previousScale = useRef(scale);
  const [dragging, setDragging] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const reduced = useRef(matchMedia('(prefers-reduced-motion: reduce)').matches);
  const timer = useRef();
  const pointer = useRef(null);
  const wake = useRef(() => {});

  useLayoutEffect(() => {
    if (previousScale.current === scale) return;
    const m = motion.current;
    m.position = remapReaderPosition(m.position, previousScale.current, scale);
    m.target = m.position;
    m.width = innerWidth;
    m.wheelActive = false;
    m.dragging = false;
    pointer.current = null;
    clearTimeout(timer.current);
    previousScale.current = scale;
    viewRef.current = {base:Math.floor(m.position), active:wrap(Math.round(m.position), count)};
    setView(viewRef.current);
    setDragging(false);
  }, [count, scale]);

  const register = useCallback((slot, node) => {
    if (node) nodes.current.set(slot, node);
    else nodes.current.delete(slot);
    wake.current();
  }, []);
  const advance = useCallback(direction => {
    if (pausedRef.current) return;
    clearTimeout(timer.current);
    motion.current.wheelActive = false;
    motion.current.target = Math.round(motion.current.target) + direction;
    wake.current();
  }, []);
  const goTo = useCallback(index => {
    clearTimeout(timer.current);
    motion.current.wheelActive = false;
    motion.current.target = forwardDestination(motion.current.target, index, count);
    wake.current();
  }, [count]);

  useEffect(() => {
    let raf = null;
    let last = performance.now();
    const render = now => {
      raf = null;
      const dt = Math.min(50, now-last);
      last = now;
      const m = motion.current;
      if (!pausedRef.current) {
        const difference = m.target-m.position;
        const damping = reduced.current || m.dragging ? 1 : 1-Math.exp(-dt/115);
        const step=difference*damping;
        m.position = Math.abs(difference)<.00006 ? m.target : m.position+(reduced.current || m.dragging ? step : Math.max(-.85,Math.min(.85,step)));
      }
      const next = {base:Math.floor(m.position), active:wrap(Math.round(m.position), count)};
      if (next.base!==viewRef.current.base || next.active!==viewRef.current.active) {
        viewRef.current = next;
        setView(next);
      }
      for (const [slot,node] of nodes.current) node.style.transform = `translate3d(${(slot-m.position)*m.width}px,0,0)`;
      const reader = document.getElementById('portfolio');
      if (reader) reader.dataset.position = m.position.toFixed(5);
      if (!pausedRef.current && Math.abs(m.target-m.position)>.00001) raf=requestAnimationFrame(render);
    };
    // No animation loop runs while the reader rests, saving battery on phones.
    wake.current = () => {
      if (raf!==null) return;
      last=performance.now()-16;
      raf=requestAnimationFrame(render);
    };
    wake.current();
    return () => {if (raf!==null) cancelAnimationFrame(raf); wake.current=()=>{};};
  }, [count]);
  useEffect(() => {wake.current();}, [paused]);

  useEffect(() => {
    const m=motion.current;
    const onWheel=event => {
      if (event.ctrlKey || event.metaKey || pausedRef.current) return;
      event.preventDefault();
      const delta=Math.abs(event.deltaY)>=Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!delta) return;
      const unit=event.deltaMode===1 ? 16 : event.deltaMode===2 ? innerHeight : 1;
      const scroll=event.target.closest('[data-reader-scroll]');
      if (scroll && Math.abs(event.deltaY)>=Math.abs(event.deltaX)) {
        const maximum=scroll.scrollHeight-scroll.clientHeight;
        if (maximum>1 && ((delta>0 && scroll.scrollTop<maximum-1) || (delta<0 && scroll.scrollTop>1))) {
          scroll.scrollTop+=delta*unit;
          return;
        }
      }
      if (!m.wheelActive) {m.origin=Math.round(m.target); m.wheelActive=true;}
      m.direction=Math.sign(delta);
      m.target+=Math.max(-1.3,Math.min(1.3,delta*unit/(innerHeight*.75)));
      clearTimeout(timer.current);
      timer.current=setTimeout(() => {
        m.target=gestureDestination(m.target,m.origin,m.direction);
        m.wheelActive=false;
        wake.current();
      },180);
      wake.current();
    };
    const onKey=event => {
      if (pausedRef.current || event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      if (event.key===' ' && event.target.closest('button,a')) return;
      if (['ArrowRight','ArrowDown','PageDown',' '].includes(event.key)) {event.preventDefault(); advance(1);}
      else if (['ArrowLeft','ArrowUp','PageUp'].includes(event.key)) {event.preventDefault(); advance(-1);}
      else if (event.key==='Home') {event.preventDefault(); goTo(0);}
      else if (event.key==='End') {event.preventDefault(); goTo(count-1);}
    };
    const resize=() => {m.width=innerWidth; wake.current();};
    window.addEventListener('wheel',onWheel,{passive:false});
    window.addEventListener('keydown',onKey);
    window.addEventListener('resize',resize);
    return () => {
      window.removeEventListener('wheel',onWheel);
      window.removeEventListener('keydown',onKey);
      window.removeEventListener('resize',resize);
      clearTimeout(timer.current);
    };
  }, [advance,count,goTo]);

  const onPointerDown=event => {
    if (pausedRef.current || event.button!==0 || event.target.closest('button,a,summary') || (event.pointerType==='mouse' && event.target.closest('h1,h2,h3,p,dl'))) return;
    clearTimeout(timer.current);
    const m=motion.current;
    m.wheelActive=false;
    m.target=m.position;
    const scroll=event.target.closest('[data-reader-scroll]');
    pointer.current={id:event.pointerId,x:event.clientX,y:event.clientY,origin:m.position,dragged:false,scroll,scrollStart:scroll?.scrollTop || 0};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove=event => {
    const p=pointer.current;
    if (!p || p.id!==event.pointerId) return;
    const dx=p.x-event.clientX,dy=p.y-event.clientY;
    const horizontal=Math.abs(dx)>Math.abs(dy);
    const delta=horizontal ? dx : dy;
    if (!horizontal && p.scroll && !p.dragged) {
      const maximum=p.scroll.scrollHeight-p.scroll.clientHeight;
      const canRead=maximum>1 && ((dy>0 && p.scrollStart<maximum-1) || (dy<0 && p.scrollStart>1));
      if (canRead || p.reading) {
        p.reading=true;
        p.scroll.scrollTop=Math.max(0,Math.min(maximum,p.scrollStart+dy));
        return;
      }
    }
    if (Math.abs(delta)>6) {
      p.dragged=true;
      motion.current.dragging=true;
      setDragging(true);
      motion.current.target=p.origin+Math.max(-1,Math.min(1,delta/(horizontal ? innerWidth : innerHeight*.75)));
      motion.current.direction=Math.sign(delta);
      wake.current();
    }
  };
  const release=cancelled => {
    const p=pointer.current;
    if (!p) return;
    const m=motion.current;
    if (cancelled) m.target=Math.round(m.position);
    else if (p.dragged) m.target=gestureDestination(m.target,Math.round(p.origin),m.direction);
    pointer.current=null;
    m.dragging=false;
    setDragging(false);
    wake.current();
  };
  return {active:view.active,slots:visibleSlots(view.base),position:motion.current.position,register,advance,goTo,dragging,
    pointerHandlers:{onPointerDown,onPointerMove,onPointerUp:()=>release(false),onPointerCancel:()=>release(true)}};
}
