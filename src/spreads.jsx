import React from 'react';
import Photo from './Photo.jsx';

export const spreads = [
  {id: 'cover', title: 'Cover', className: 'spread cover', pages: [
          <article className="page cover-front" lang="en" aria-label="Обложка">
            <img className="cover-photo" src="assets/photos/cover.webp" alt="Модель в чёрном вечернем платье на тёмном фоне" width="1024" height="1536" fetchPriority="high" />
            <div className="cover-shade" aria-hidden="true"></div>
            <div className="cover-masthead"><span>Modeling</span><h1>PORTFOLIO</h1></div>
            <div className="cover-story">Poised for<br />the Future<em>a portfolio of<br />distinction</em></div>
            <div className="cover-name"><em>I aspire to become a top model</em><h2>JENNIFER</h2></div>
            <div className="cover-signoff">Embracing Elegance<em>with confidence</em></div>
          </article>,
          <article className="page back-cover" lang="en" aria-label="Портрет и контакты">
            <figure className="back-portrait"><img src="assets/photos/back-cover.webp" alt="Чёрно-белый портрет Jennifer" width="1024" height="1536" /></figure>
            <div className="back-caption"><div><h2>Visit more works</h2><button className="text-link" type="button" data-go="content">Explore the portfolio</button><span>Jennifer Williams · Fashion Model</span></div><button className="monogram" type="button" data-go="content" aria-label="Открыть содержание">JW</button></div>
          </article>
        ]},
  {id: 'editorial', title: 'Editorial', className: 'spread editorial', wideContent: <>
          <h2 className="sr-only">Editorial</h2>
          <figure className="editorial-photo"><img src="assets/photos/editorial.webp" alt="Чёрно-белая fashion-съёмка: девушка и мужчина в профиль" width="1536" height="1024" decoding="async" /></figure>
          <span className="editorial-fold" aria-hidden="true"></span>
          <div className="editorial-caption" lang="en"><span>THE ART OF EXPRESSION</span><span>01 — 02</span></div>
        </>},
  {id: 'about', title: 'About me', className: 'spread', pages: [
          <article className="page profile-page" lang="en">
            <div className="running-head"><span>• About Me</span><span>03</span></div>
            <img className="profile-small" src="assets/photos/about.webp" alt="Jennifer в чёрном платье, полный рост" width="1024" height="1536" decoding="async" />
            <dl className="model-stats"><div><dt>Height:</dt><dd>5'8 / 172 cm</dd></div><div><dt>Waist:</dt><dd>25 / 64 cm</dd></div><div><dt>Hips:</dt><dd>35 / 89 cm</dd></div><div><dt>Shoe size:</dt><dd>38 / EU</dd></div></dl>
            <img className="profile-large" src="assets/photos/about.webp" alt="Портрет модели с руками на талии" width="1024" height="1536" decoding="async" />
            <div className="profile-name"><h2>Jennifer<br /><span>Williams</span></h2><p>Fashion model · Portfolio model</p></div>
          </article>,
          <article className="page about-page" lang="en">
            <h2>ABOUT ME</h2>
            <div className="about-sections">
              <section><h3>Awards</h3><p>A dedication to expressive imagery.<br />From emerging faces to editorial stories,<br />each project is an opportunity to create.<br />Poised, imaginative and always evolving.</p></section>
              <section><h3>Experience</h3><p>Fashion editorials and commercial campaigns.<br />Studio beauty, runway and location shoots.<br />Collaborating with creative teams to bring<br />their vision to life, one frame at a time.</p></section>
              <section><h3>Skills</h3><p>Editorial posing · Beauty · Movement<br />Natural expression and camera presence.<br />Comfortable in both studio and location work.</p></section>
              <section><h3>Agency</h3><p>Open to creative collaborations worldwide.<br />Available for fashion and commercial projects.</p></section>
              <section><h3>Contact</h3><p>For bookings and creative enquiries:<br />contact details available upon request.</p></section>
            </div>
          </article>
        ]},
  {id: 'content', title: 'Content', className: 'spread', pages: [
          <article className="page contents-page" lang="en">
            <h2>CONTENT</h2>
            <Photo className="photo-cell contents-photo" photo="lifestyle" cell={1} alt="Модель в вязаном капюшоне у моря" />
            <nav className="contents-grid" aria-label="Главы портфолио">
              <button type="button" data-go="about"><span className="chapter-number">03</span><h3>ABOUT ME</h3><p>A closer look at the model behind the photographs. Experience, expression and the details that shape a personal story.</p></button>
              <button type="button" data-go="classic"><span className="chapter-number">07</span><h3>CLASSIC POSE</h3><p>Timeless silhouettes and effortless movement. A collection of studio photographs, full-body poses and commercial beauty.</p></button>
              <button type="button" data-go="lifestyle"><span className="chapter-number">11</span><h3>LIFESTYLE</h3><p>Quiet moments along the shoreline. Natural light, sea air and a relaxed expression, captured beyond the studio.</p></button>
              <button type="button" data-go="concept"><span className="chapter-number">15</span><h3>CONCEPT SHOTS</h3><p>Stories told through a different lens. Monochrome tailoring and the warm desert light explore another side of the portfolio.</p></button>
            </nav>
          </article>,
          <article className="page full-photo"><Photo className="photo-cell" photo="lifestyle" cell={0} alt="Крупный портрет модели в вязаном капюшоне на фоне моря" /></article>
        ]},
  {id: 'classic', title: 'Classic pose', className: 'spread', pages: [
          <article className="page vertical-photo-page" lang="en">
            <div className="running-head"><span>• Classic Pose</span><span>07</span></div>
            <Photo className="photo-cell vertical-portrait" photo="classic" cell={0} alt="Классическая поза в светлом комбинезоне" /><h2 className="vertical-title">CLASSIC POSE</h2>
          </article>,
          <article className="page four-grid-page" lang="en">
            <div className="running-head"><span>Jennifer Williams</span><span>Classic Pose •</span></div>
            <div className="four-grid">
              <div className="grid-story"><h2>CASUAL<br />FULL BODY<br />SHOTS</h2><p className="dropcap">Here is a quiet kind of confidence: a simple silhouette, an unhurried movement and a natural connection to the camera. These classic studio poses let proportion, texture and personality speak for themselves.</p></div>
              <Photo className="photo-cell" photo="classic" cell={1} alt="Динамичная поза с поднятым коленом" />
              <Photo className="photo-cell" photo="classic" cell={2} alt="Модель в движении" />
              <Photo className="photo-cell" photo="classic" cell={3} alt="Модель в полный рост" />
            </div>
          </article>
        ]},
  {id: 'commercial', title: 'Commercial shots', className: 'spread', pages: [
          <article className="page full-photo"><Photo className="photo-cell" photo="commercial" cell={0} alt="Фронтальный beauty-портрет модели" /></article>,
          <article className="page commercial-page" lang="en">
            <div className="running-head"><span>• Beauty</span><span>10</span></div>
            <div className="commercial-grid">
              <Photo className="photo-cell commercial-main" photo="commercial" cell={1} alt="Beauty-портрет с поднятым взглядом" />
              <div className="commercial-title"><h2>COMMERCIAL<br />SHOTS</h2><p className="dropcap">Beauty begins with a feeling. Natural light, clean lines and an honest expression create images that feel both timeless and alive.</p></div>
              <div className="commercial-copy"><p>Subtle gestures tell a story: a hand resting at the neck, a moment of stillness, the softness of a smile. Every photograph celebrates the character behind the face.</p><p>A thoughtful approach to beauty photography brings together luminous skin, simple details and a strong connection with the camera.</p></div>
              <Photo className="photo-cell commercial-detail" photo="commercial" cell={2} alt="Портрет с белыми круглыми серьгами" />
              <Photo className="photo-cell commercial-smile" photo="commercial" cell={3} alt="Улыбка и белая косметическая пуховка" />
            </div>
          </article>
        ]},
  {id: 'lifestyle', title: 'Lifestyle', className: 'spread', pages: [
          <article className="page vertical-photo-page" lang="en">
            <div className="running-head"><span>• Lifestyle</span><span>11</span></div>
            <Photo className="photo-cell vertical-portrait" photo="lifestyle" cell={0} alt="Портрет у моря" /><h2 className="vertical-title title-top">LIFESTYLE</h2>
          </article>,
          <article className="page four-grid-page" lang="en">
            <div className="running-head"><span>Jennifer Williams</span><span>Lifestyle •</span></div>
            <div className="four-grid beach-one-grid">
              <Photo className="photo-cell" photo="lifestyle" cell={2} alt="Модель в светлом платье на мокром песке" />
              <Photo className="photo-cell" photo="lifestyle" cell={1} alt="Модель на фоне береговой линии" />
              <div className="grid-story"><h2>PORTRAIT<br />ON THE<br />BEACH — ONE</h2><p className="dropcap">Nothing feels quite like the sea. A soft breeze, a pale horizon and the texture of the shore give these portraits their quiet rhythm. Natural light creates space for an expression to unfold.</p></div>
              <Photo className="photo-cell" photo="lifestyle" cell={3} alt="Сидящая модель на берегу" />
            </div>
          </article>
        ]},
  {id: 'beach', title: 'Portrait on the beach', className: 'spread', pages: [
          <article className="page beach-two-page" lang="en">
            <div className="running-head"><span>• Lifestyle</span><span>13</span></div>
            <div className="beach-two-grid">
              <div className="beach-two-intro"><h2>PORTRAIT<br />ON THE<br />BEACH — TWO</h2><p>Soft fabric, sea air and a moment of calm. A portrait that feels as effortless as the light.</p></div>
              <Photo className="photo-cell beach-standing" photo="beach" cell={1} alt="Портрет в белой блузке у моря" />
              <Photo className="photo-cell beach-seated" photo="beach" cell={2} alt="Модель в белом сидит на песке" />
              <p className="beach-two-copy">The shoreline becomes a simple backdrop for a personal story. Wind moves through the hair; the fabric catches the light. Each frame captures a little of that fleeting atmosphere.</p>
            </div>
          </article>,
          <article className="page full-photo"><Photo className="photo-cell" photo="beach" cell={0} alt="Крупный портрет модели, подбородок опирается на руки" /></article>
        ]},
  {id: 'concept', title: 'Concept shots', className: 'spread', pages: [
          <article className="page vertical-photo-page concept-main" lang="en">
            <div className="running-head"><span>• Concept Shots</span><span>15</span></div>
            <Photo className="photo-cell vertical-portrait" photo="concept" cell={0} alt="Чёрно-белый портрет девушки с каре в чёрном пиджаке" /><h2 className="vertical-title title-left">CONCEPT SHOTS</h2>
          </article>,
          <article className="page formal-page" lang="en">
            <div className="running-head"><span>Jennifer Williams</span><span>Concept Shots •</span></div>
            <div className="formal-grid">
              <Photo className="photo-cell formal-pose" photo="concept" cell={1} alt="Драматичная поза в чёрном костюме" />
              <div className="formal-story"><h2>CONCEPT<br />SHOTS<br />BE FORMAL</h2><p className="dropcap">New perspectives begin with a change of mood. Tailored shapes and black-and-white light bring a sharper edge to the portrait. Expression becomes a study in strength and restraint.</p><p>A gesture, a glance, the line of a jacket: every detail contributes to the story.</p></div>
              <Photo className="photo-cell formal-man" photo="concept" cell={2} alt="Мужской портрет в чёрном костюме" />
              <Photo className="photo-cell formal-woman" photo="concept" cell={3} alt="Женский портрет в чёрном костюме" />
            </div>
          </article>
        ]},
  {id: 'desert', title: 'Concept shots — desert', className: 'spread', pages: [
          <article className="page desert-page" lang="en">
            <div className="running-head"><span>• Concept Shots</span><span>17</span></div>
            <div className="desert-grid">
              <div className="desert-intro"><h2>CONCEPT<br />SHOTS<br />BE DESERT</h2><p>Warm light and sculpted stone. A story of stillness in a landscape shaped by time.</p></div>
              <Photo className="photo-cell desert-seated" photo="desert" cell={1} alt="Модель сидит на песчаном камне" />
              <Photo className="photo-cell desert-profile" photo="desert" cell={2} alt="Профиль модели среди скал" />
              <Photo className="photo-cell desert-detail" photo="desert" cell={3} alt="Задумчивый портрет в пустыне" />
              <p className="desert-copy dropcap">Beyond the studio, the landscape brings its own character. Sunlight traces the skin, shadows deepen the folds of fabric, and sandstone frames a quiet moment. This is an exploration of texture, presence and place.</p>
            </div>
          </article>,
          <article className="page full-photo"><Photo className="photo-cell" photo="desert" cell={0} alt="Модель в зеркальных очках лежит на песке, прикрыв лоб рукой" /></article>
        ]},];

