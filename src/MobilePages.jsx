import React, {useLayoutEffect, useRef, useState} from 'react';

function paragraphs(node, result = []) {
  React.Children.forEach(node, child => {
    if (!React.isValidElement(child)) return;
    if (child.type === 'p') result.push(child);
    else paragraphs(child.props.children, result);
  });
  return result;
}

function EditorialPage({part}) {
  return <article className={`page editorial-portrait editorial-portrait-${part}`} lang="en">
    <img src={`${import.meta.env.BASE_URL}assets/photos/editorial.webp`} alt={part ? 'Мужской fashion-портрет' : 'Женский fashion-портрет'} width="1536" height="1024" decoding="async" />
    <div className="editorial-portrait-shade" />
    <div className="editorial-portrait-title"><span>THE ART OF EXPRESSION</span><h2>{part ? <>A different<br /><em>perspective.</em></> : <>Every frame<br /><em>tells a story.</em></>}</h2><p>Jennifer Williams · Editorial</p></div>
  </article>;
}

export function readerUnits(spreads, mobile) {
  return spreads.flatMap((spread, chapterIndex) => {
    if (!mobile) return [{...spread, chapterIndex, part:0, content:spread.wideContent || React.Children.toArray(spread.pages)}];
    const pages = spread.pages || [<EditorialPage part={0} />, <EditorialPage part={1} />];
    return pages.map((page, part) => {
      const copy = ['classic','commercial','lifestyle','beach','concept','desert'].includes(spread.id) ? paragraphs(page) : [];
      return {...spread, chapterIndex, part, content:page, story:copy, title:spread.id==='cover' && part===1 ? 'More works' : spread.title};
    });
  });
}

function MobileAbout({page}) {
  const [open, setOpen] = useState(0);
  const list = useRef(null);
  useLayoutEffect(() => {
    const scroll = list.current;
    if (!scroll) return;
    const item = open===null ? null : scroll.children[open];
    const top = item ? item.getBoundingClientRect().top-scroll.getBoundingClientRect().top+scroll.scrollTop : 0;
    scroll.scrollTop = Math.max(0,Math.min(scroll.scrollHeight-scroll.clientHeight,top));
  }, [open]);
  const sections = React.Children.toArray(page.props.children).find(child => child.props?.className==='about-sections');
  const items = React.Children.toArray(sections.props.children);
  return <article className="page about-page phone-about" lang="en">
    <span className="phone-eyebrow">BEHIND THE LENS</span>
    <h2>ABOUT<br /><em>ME.</em></h2>
    <div className="phone-about-list" data-reader-scroll ref={list}>
      {items.map((item,index) => {
        const [heading,copy] = React.Children.toArray(item.props.children);
        return <section key={index} className={open===index ? 'expanded' : ''}>
          <h3><button type="button" aria-expanded={open===index} aria-controls={`about-panel-${index}`} onClick={() => setOpen(open===index ? null : index)}><span className="about-index">0{index+1}</span><span>{heading.props.children}</span><i aria-hidden="true">{open===index ? '−' : '+'}</i></button></h3>
          <div id={`about-panel-${index}`} hidden={open!==index} className="about-panel">{React.cloneElement(copy,{},React.Children.toArray(copy.props.children).map(child => React.isValidElement(child) && child.type==='br' ? ' ' : child))}</div>
        </section>;
      })}
    </div>
  </article>;
}

const photoTitles = {content:<>Natural<br /><em>presence.</em></>,commercial:<>The beauty<br /><em>of stillness.</em></>,beach:<>By<br /><em>the sea.</em></>,desert:<>Golden<br /><em>silence.</em></>};

export default function MobilePage({unit, onStory}) {
  const page = unit.content;
  if (unit.id==='about' && unit.part===1) return <MobileAbout page={page} />;
  const fullPhoto = page.props.className?.includes('full-photo');
  const content = <>
    {page.props.children}
    {unit.id==='cover' && unit.part===0 && <div className="phone-swipe-hint"><span aria-hidden="true">←</span>Свайп влево или вверх</div>}
    {fullPhoto && photoTitles[unit.id] && <div className="phone-photo-caption" lang="en"><span>JENNIFER WILLIAMS / {unit.title.toUpperCase()}</span><h2>{photoTitles[unit.id]}</h2></div>}
    {unit.story.length>0 && <button className="story-button" type="button" onClick={() => onStory(unit)}>О съёмке <span aria-hidden="true">↗</span></button>}
  </>;
  return React.cloneElement(page,{className:`${page.props.className} phone-page${unit.story.length ? ' has-story' : ''}`},content);
}

export function StorySheet({unit, onClose}) {
  return <section className="story-sheet" role="dialog" aria-modal="true" aria-labelledby="story-heading"
    onClick={event => {if (event.target===event.currentTarget) onClose();}}
    onKeyDown={event => {
      if (event.key==='Escape') {event.stopPropagation(); onClose();}
      if (event.key==='Tab') {event.preventDefault(); event.currentTarget.querySelector('button').focus();}
    }}>
    <div className="story-panel">
      <div className="sheet-handle" aria-hidden="true" />
      <div className="story-header"><span>THE STORY BEHIND THE FRAME</span><button type="button" onClick={onClose} aria-label="Закрыть описание" autoFocus>×</button></div>
      <div className="story-body" lang="en"><h2 id="story-heading">{unit.title}</h2>{React.Children.toArray(unit.story)}</div>
    </div>
  </section>;
}
