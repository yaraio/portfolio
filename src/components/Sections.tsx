import { useEffect, useRef, useState } from 'react';
import { profile, projects, experience, awards, toolkit, letter, letterTodo, indexCard, postcard, type Project } from '../data/content';
import { Paper, Tape, Stamp, PaperClip, WaxSeal, deco, type Washi } from './Deco';
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
      <div className="hero__after" style={{ top: `calc(${bottom * 100}% + 18px)` }}>
        <ul className="labels" aria-label="What I do">
          {profile.roles.map((r) => <li key={r} className="label">{r}</li>)}
        </ul>
        <a className="hero__scroll caption" href="#work">turn the page ↓</a>
      </div>
    </header>
  );
}

const PROJECT_TAPES: Washi[] = ['torn', 'mauve', 'olive'];

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const [open, setOpen] = useState(false);
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
        <button className="story-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? '− close the story' : '+ read the story'}
        </button>
        {open && (
          <div className="story">
            {p.story.map((s) => (
              <div key={s.heading}>
                <h4>{s.heading}</h4>
                {s.body && <p>{s.body}</p>}
                {s.bullets && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
              </div>
            ))}
            {p.link && <a href={p.link.href} target="_blank" rel="noopener noreferrer">{p.link.label} →</a>}
          </div>
        )}
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

export function Experience() {
  return (
    <section id="experience" className="section">
      <Heading script="Where" caps="I've been" />
      <div className="notebook">
        {experience.map((e, i) => (
          <Paper key={e.org} edge="torn" className="notebook__page" style={{ transform: `rotate(${[-1.6, 1.2, -0.7][i % 3]}deg)` }}>
            {i === 1 && <Tape variant="gingham" style={{ top: -14, left: '50%', marginLeft: -48, transform: 'rotate(3deg)' }} />}
            {i !== 1 && <PaperClip style={{ top: -30, right: 28, transform: 'rotate(8deg)' }} />}
            <p className="caption notebook__when">{e.when}</p>
            <h3>{e.org}</h3>
            <p className="eyebrow">{e.role}</p>
            <p>{e.body}</p>
          </Paper>
        ))}
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="section">
      <Heading script="About" caps="me" />
      <div className="about">
        <div className="idcard">
          <PaperClip style={{ top: -22, left: 30, transform: 'rotate(4deg)' }} />
          <div className="idcard__card">
            <p className="idcard__name">{profile.first} {profile.last}</p>
            <ul className="idcard__lines">
              {indexCard.map((l, i) => (
                <li key={l}><span style={{ transform: `translate(${(i * 7) % 5 - 2}px, ${((i * 3) % 3) - 1}px) rotate(${((i * 5) % 7 - 3) * 0.15}deg)` }}>{l}</span></li>
              ))}
              <li /><li />
            </ul>
          </div>
        </div>

        <Paper className="letter">
          <Tape variant="kraft-tex" style={{ top: -12, right: 30, transform: 'rotate(6deg)' }} />
          <p className="letter__dear">Dear reader,</p>
          {letter.map((l) => <p key={l}>{l}</p>)}
          <p className="todo">{letterTodo}</p>
          <p className="letter__sign">{profile.first}</p>
          <WaxSeal className="seal--small" style={{ right: 26, bottom: 22, transform: 'rotate(-8deg)' }} />
        </Paper>

        <div className="awards">
          <h3 className="eyebrow">honors</h3>
          {awards.map((a, i) => (
            <div key={a.title} className="award">
              <WaxSeal className="seal--small" style={{ position: 'static', transform: `rotate(${i * 9 - 8}deg)` }} />
              <div><strong>{a.title}</strong><span>{a.detail}</span></div>
            </div>
          ))}
          <h3 className="eyebrow" style={{ marginTop: 18 }}>my toolkit</h3>
          <ul className="labels labels--small">{toolkit.map((t) => <li key={t} className="label">{t}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

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
        <div className="postcard__note">
          <p className="postcard__hi">{postcard.greeting}</p>
          {postcard.body.map((l) => <p key={l}>{l}</p>)}
          <p className="postcard__bye">{postcard.signoff}</p>
          <p className="postcard__sign">{profile.first}</p>
          <p className="postcard__ps">{postcard.ps}</p>
        </div>
        <div className="postcard__address">
          <div className="postcard__corner">
            <div className="postage" aria-hidden="true">
              <div className="postage__paper">
                <div className="postage__art">
                  <span className="postage__y">{profile.first}</span>
                  <span className="postage__year">MMXXVI</span>
                </div>
              </div>
            </div>
            <Stamp top={postcard.postmark.top} bottom={postcard.postmark.bottom} small style={{ top: 26, transform: 'rotate(-10deg)' }} />
            <svg className="cancel" viewBox="0 0 160 40" aria-hidden="true">
              <g filter="url(#distress)" fill="none" stroke="currentColor" strokeWidth="2">
                {[6, 16, 26, 36].map((y) => <path key={y} d={`M0 ${y} q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0`} />)}
              </g>
            </svg>
          </div>
          <ul className="postcard__lines">
            <li><span className="postcard__label">write to</span> <span id="email">{profile.email}</span>
              <button className="postcard__copy" onClick={copy}>{copied === 'copied' ? 'copied!' : copied === 'selected' ? 'press Ctrl+C' : '(copy)'}</button>
            </li>
            <li><span className="postcard__label">or find me</span> <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">linkedin</a></li>
            <li><span className="postcard__label">and</span> <a href={profile.github} target="_blank" rel="noopener noreferrer">github</a></li>
            <li><span className="postcard__label">from</span> {profile.home} &amp; Ithaca, NY</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
