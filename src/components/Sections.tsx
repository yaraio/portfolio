import { useEffect, useRef, useState } from 'react';
import { profile, projects, experience, awards, toolkit, letter, letterTodo, indexCard, postcard, certifications, type Project } from '../data/content';
import { Tape, Stamp, WaxSeal, deco, type Washi } from './Deco';
import type { Sheet } from '../paper/useSheet';
import { drawHero } from '../paper/heroText';

const img = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

function Heading({ script, caps }: { script: string; caps: string }) {
  return (
    <h2 className="heading">
      <span className="heading__script">{script}</span>
      <span className="heading__caps">{caps}</span>
    </h2>
  );
}

export function Hero({ sheet }: { sheet: Sheet | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [bottom, setBottom] = useState(0.8);
  const H = sheet?.H ?? window.innerHeight;

  // the printed words are drawn by the same code the intro uses, so they line up exactly
  useEffect(() => {
    const c = ref.current;
    if (!c || !sheet) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(sheet.W * dpr);
    c.height = Math.round(sheet.H * dpr);
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    setBottom(drawHero(ctx, sheet.W, sheet.H) / sheet.H);
  }, [sheet]);

  return (
    <header className="hero" id="top" style={{ height: H }}>
      <canvas ref={ref} className="hero__print" style={sheet ? { width: sheet.W, height: sheet.H } : undefined} aria-hidden="true" />
      <h1 className="sr-only">{profile.first} {profile.last}: {profile.tagline}</h1>
      {sheet && <HeroDeco W={sheet.W} H={sheet.H} />}
      <div className="hero__after" style={{ top: `calc(${bottom * 100}% + 18px)` }}>
        <ul className="labels" aria-label="What I do">
          {profile.roles.map((r) => <li key={r} className="label">{r}</li>)}
        </ul>
        <a className="hero__scroll caption" href="#work">turn the page ↓</a>
      </div>
    </header>
  );
}

// little things tucked around the printed name: a scrap that says hi, and a paper butterfly.
// Placed from the same measurements drawHero uses, so they sit by the name at any size.
function HeroDeco({ W, H }: { W: number; H: number }) {
  const unit = Math.min(W, H * 1.1);
  const nameY = H * 0.4;
  return (
    <div className="hero__deco" aria-hidden="true">
      <div className="hi-scrap" style={{ width: unit * 0.19, left: W / 2 - unit * 0.47, top: nameY - unit * 0.13 }}>
        <span style={{ fontSize: Math.max(13, unit * 0.022) }}>hi, I&rsquo;m</span>
      </div>
      <img className="hero__butterfly" src={deco('butterfly.webp')} alt="" style={{ width: unit * 0.17, left: W / 2 + unit * 0.2, top: nameY - unit * 0.12 }} />
    </div>
  );
}

// The project's story as a few pages you flip through, instead of one long expanding block.
// Every page is laid in the same grid cell, so the card keeps the height of the longest one.
function Pages({ p }: { p: Project }) {
  const [at, setAt] = useState(0);
  const n = p.story.length;
  const go = (d: number) => setAt((v) => (v + d + n) % n);
  return (
    <div className="pages">
      <div className="pages__stack">
        {p.story.map((s, k) => (
          <div key={s.heading} className={`pages__page${k === at ? ' is-on' : ''}`} aria-hidden={k !== at}>
            <h4>{s.heading}</h4>
            {s.body && <p>{s.body}</p>}
            {s.bullets && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
            {k === n - 1 && p.link && <a href={p.link.href} target="_blank" rel="noopener noreferrer" tabIndex={k === at ? 0 : -1}>{p.link.label} →</a>}
          </div>
        ))}
      </div>
      {n > 1 && (
        <div className="pages__nav">
          <button onClick={() => go(-1)} aria-label="previous page">‹</button>
          <span className="pages__dots" aria-live="polite">
            {p.story.map((s, k) => (
              <button key={s.heading} className={k === at ? 'is-on' : ''} onClick={() => setAt(k)} aria-label={`page ${k + 1}: ${s.heading}`} />
            ))}
          </span>
          <button onClick={() => go(1)} aria-label="next page">›</button>
          <span className="pages__count caption">{at + 1} / {n}</span>
        </div>
      )}
    </div>
  );
}

const PROJECT_TAPES: Washi[] = ['torn', 'mauve', 'olive'];

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const flip = i % 2 === 1;
  const [first, ...rest] = p.images;
  return (
    <article className={`project${flip ? ' project--flip' : ''}`}>
      <div className="project__shots">
        <figure className="lace">
          <img className="lace__frame" src={deco('lace.webp')} alt="" aria-hidden="true" />
          <div className="lace__window">
            {first ? <img src={img(first)} alt={`${p.title} screenshot`} /> : <span className="caption">{p.imageNote}<br />coming soon</span>}
          </div>
        </figure>
        {rest.length > 0 && (
          <div className="project__more">
            {rest.map((f, j) => (
              <figure key={f} className="photo" style={{ transform: `rotate(${j % 2 ? 3 : -2.5}deg)` }}>
                <Tape variant={PROJECT_TAPES[(i + j) % 3]} style={{ top: -12, left: '50%', marginLeft: -45, transform: 'rotate(-4deg)' }} />
                <div className="photo__img"><img src={img(f)} alt={`${p.title} screenshot ${j + 2}`} /></div>
              </figure>
            ))}
          </div>
        )}
        {p.award && <Stamp top={p.award} bottom={p.when} style={{ right: -6, bottom: -30, transform: `rotate(${flip ? -12 : 9}deg)` }} />}
        {i % 2 === 0 && <img className={`flowers${i ? ' flowers--b' : ''}`} src={deco('flowers.webp')} alt="" aria-hidden="true" />}
      </div>
      <div className="deckle project__sheet">
        <WaxSeal gold className="deckle__seal" />
        <Tape variant={PROJECT_TAPES[i % 3]} className="deckle__tape" />
        <span className="eyebrow">{p.kicker}</span>
        <h3 className="project__title">{p.title}</h3>
        <p className="caption">{p.when} · {p.role}</p>
        <p>{p.summary}</p>
        <ul className="labels labels--small">{p.tools.map((t) => <li key={t} className="label">{t}</li>)}</ul>
        <Pages p={p} />
      </div>
    </article>
  );
}

export function Work() {
  return (
    <section id="work" className="section">
      <Heading script="Selected" caps="work" />
      <p className="caption section__note">things I&rsquo;ve made with care (and a lot of caffeine)</p>
      <div className="projects">
        {projects.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
      </div>
    </section>
  );
}

// A notebook page that shows the heading, and opens to the details on hover, keyboard
// focus or a tap (touch screens can't hover, so the tap matters).
function ExperiencePage({ e, i }: { e: (typeof experience)[number]; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      className={`notebook__page${open ? ' is-open' : ''}`}
      style={{ ['--tilt' as string]: `${[-1.6, 1.2, -0.7][i % 3]}deg` }}
      aria-expanded={open}
      onClick={(ev) => {
        // a mouse already opens the page by hovering, so a click shouldn't pin it open;
        // taps and the keyboard (detail 0) toggle it
        if (ev.detail > 0 && matchMedia('(hover: hover)').matches) return;
        setOpen(!open);
      }}
    >
      {i === 1 && <Tape variant="gingham" style={{ top: -14, left: '50%', marginLeft: -48, transform: 'rotate(3deg)' }} />}
      <span className="caption notebook__when">{e.when}</span>
      <span className="notebook__org">{e.org}</span>
      <span className="eyebrow">{e.role}</span>
      <span className="notebook__more"><span>{e.body}</span></span>
      <span className="notebook__hint caption" aria-hidden="true">{open ? 'close' : 'open'} ↓</span>
    </button>
  );
}

export function Experience() {
  return (
    <section id="experience" className="section">
      <Heading script="Where" caps="I've been" />
      <div className="notebook">
        {experience.map((e, i) => (
          <ExperiencePage key={e.org} e={e} i={i} />
        ))}
      </div>
    </section>
  );
}

const HONOR_SEALS = ['bee', 'butterfly', 'valley'];

export function About() {
  return (
    <section id="about" className="section">
      <Heading script="About" caps="the author" />
      <div className="about">
        <div className="about__side">
          <figure className="oval">
            {profile.photo
              ? <><img className="oval__photo" src={img(profile.photo)} alt={`${profile.first} ${profile.last}`} /><img className="oval__frame" src={deco('oval-empty.webp')} alt="" aria-hidden="true" /></>
              : <img className="oval__frame" src={deco('oval.webp')} alt="" aria-hidden="true" />}
          </figure>
          <div className="idcard">
            <p className="idcard__name">{profile.first} {profile.last}</p>
            <ul className="idcard__lines">
              {indexCard.map((l, i) => (
                <li key={l}><span style={{ transform: `translate(${(i * 7) % 5 - 2}px, 0) rotate(${((i * 5) % 7 - 3) * 0.15}deg)` }}>{l}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="letter">
          <p className="letter__dear">Dear reader,</p>
          {letter.map((l) => <p key={l}>{l}</p>)}
          <p className="todo">{letterTodo}</p>
          <p className="letter__sign">{profile.first}</p>
          <img className="seal seal--small" src={deco('seal-sprig.webp')} alt="" aria-hidden="true" style={{ right: 34, bottom: 34, transform: 'rotate(-8deg)' }} />
        </div>

        <div className="awards">
          <h3 className="eyebrow">honors</h3>
          {awards.map((a, i) => (
            <div key={a.title} className="award">
              <img className="seal seal--small" src={deco(`seal-${HONOR_SEALS[i % 3]}.webp`)} alt="" aria-hidden="true" style={{ position: 'static', transform: `rotate(${i * 9 - 8}deg)` }} />
              <div><strong>{a.title}</strong><span>{a.detail}</span></div>
            </div>
          ))}
          <div className="toolkit">
            <div className="toolkit__grid">
              <h3 className="eyebrow">my toolkit</h3>
              <ul className="toolkit__list">{toolkit.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>

      <div className="certs" id="certifications">
        <h3 className="eyebrow">certifications</h3>
        <ul className="certs__row">
          {certifications.map((c, i) => (
            <li key={c.name} className="cert" style={{ transform: `rotate(${[-3, 2, -1.5, 2.5, -2][i % 5]}deg)` }}>
              <img className="cert__tag" src={deco('tag.webp')} alt="" aria-hidden="true" />
              <div className="cert__text">
                <span className="cert__issuer">{c.issuer}</span>
                <span className="cert__name">{c.name}</span>
                <span className="cert__year caption">certified {c.year}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const bare = (url: string) => url.replace(/^https:\/\/(www\.)?/, '');

export function Contact() {
  const [copied, setCopied] = useState<'idle' | 'copied' | 'selected'>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied('copied');
    } catch {
      const el = document.getElementById('email');
      if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); }
      setCopied('selected');
    }
    setTimeout(() => setCopied('idle'), 2000);
  };
  return (
    <section id="contact" className="section">
      <Heading script="Say" caps="hi" />
      <div className="postcard">
        <p className="postcard__title">Postcard</p>
        <div className="postcard__note">
          <p className="postcard__hi">{postcard.greeting}</p>
          {postcard.body.map((l) => <p key={l}>{l}</p>)}
          <p className="postcard__ps">{postcard.ps}</p>
        </div>
        <span className="postcard__fromlabel" aria-hidden="true">From:</span>
        <p className="postcard__from">{profile.first}</p>
        <div className="postcard__corner">
          <div className="postage" aria-hidden="true">
            <div className="postage__paper">
              <div className="postage__art">
                <img src={deco('seal-tulip.webp')} alt="" />
              </div>
            </div>
          </div>
          <Stamp top={postcard.postmark.top} bottom={postcard.postmark.bottom} small style={{ transform: 'rotate(-10deg)' }} />
          <svg className="cancel" viewBox="0 0 160 40" aria-hidden="true">
            <g filter="url(#distress)" fill="none" stroke="currentColor" strokeWidth="2">
              {[6, 16, 26, 36].map((y) => <path key={y} d={`M0 ${y} q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0`} />)}
            </g>
          </svg>
        </div>
        <ul className="postcard__lines">
          <li><span id="email">{profile.email}</span>
            <button className="postcard__copy" onClick={copy}>{copied === 'copied' ? 'copied!' : copied === 'selected' ? 'press Ctrl+C' : '(copy)'}</button>
          </li>
          <li><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">{bare(profile.linkedin)}</a></li>
          <li><a href={profile.github} target="_blank" rel="noopener noreferrer">{bare(profile.github)}</a></li>
          <li>{profile.home} &amp; Ithaca, NY</li>
        </ul>
      </div>
    </section>
  );
}
