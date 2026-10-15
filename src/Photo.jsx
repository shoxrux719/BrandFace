import React from 'react';

export default function Photo({className = 'photo-cell', photo, cell = 0, alt}) {
  const splitY = photo === 'classic' ? 679 : 724;
  const cropY = cell > 1 ? splitY + 1 : 0;
  const cropHeight = cell > 1 ? 1448 - cropY : splitY - 1;
  const ratio = 543 / cropHeight;
  return <figure className={className} role="img" aria-label={alt}
    style={{'--photo-width': `${ratio * 100}cqh`, '--photo-height': `${100 / ratio}cqw`}}>
    <div className="photo-tile"><img src={`${import.meta.env.BASE_URL}assets/photos/${photo}.webp`} alt="" draggable={false} decoding="async"
      style={{width: '200%', height: `${1448 / cropHeight * 100}%`, left: cell % 2 ? '-100%' : '0', top: `${-cropY / cropHeight * 100}%`}} /></div>
  </figure>;
}
