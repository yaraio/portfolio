import { useEffect, useRef, useState } from 'react';
import { profile, projects, experience, awards, toolkit, letter, letterTodo, type Project } from '../data/content';
import { Paper, Tape, Stamp, PaperClip, WaxSeal } from './Deco';
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

function ProjectCard({ p, flip }: { p: Project; flip: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`project${flip ? ' project--flip' : ''}`}>
      <div className="project__shots">
        {p.images.length ? (
          p.images.map((f, i) => (
            <figure key={f} className="photo project__photo" style={{ transform: `rotate(${(i % 2 ? 3 : -2.5) + i}deg)` }}>
              <Tape variant={i % 2 ? 'kraft' : 'masking'} style={{ top: -12, left: '50%', marginLeft: -48, transform: 'rotate(-4deg)' }} />
              <div className="photo__img"><img src={img(f)} alt={`${p.title} screenshot ${i + 1}`} /></div>
            </figure>
          ))
        ) : (
          <figure className="photo project__photo">
            <Tape variant="masking" style={{ top: -12, left: '50%', marginLeft: -48, transform: 'rotate(-4deg)' }} />
            <div className="photo__img photo__img--empty"><span className="caption">{p.imageNote} coming soon</span></div>
            <figcaption className="caption">{p.title}, {p.when}</figcaption>
          </figure>
        )}
        {p.award && <Stamp top={p.award} bottom={p.when} style={{ right: -14, bottom: -26, transform: `rotate(${flip ? -12 : 9}deg)` }} />}
      </div>
      <Paper className="project__sheet">
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
      </Paper>
    </article>
  );
}

export function Work() {
  return (
    <section id="work" className="section">
      <Heading script="Selected" caps="work" />
      <p className="caption section__note">things I&rsquo;ve made with care (and a lot of caffeine)</p>
      <div className="projects">
        {projects.map((p, i) => <ProjectCard key={p.id} p={p} flip={i % 2 === 1} />)}
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
            {i === 1 && <Tape variant="kraft" style={{ top: -14, left: '50%', marginLeft: -48, transform: 'rotate(3deg)' }} />}
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
        <div className="libcard">
          <div className="libcard__pocket" aria-hidden="true" />
          <div className="libcard__card">
            <div className="libcard__head">
              <span className="eyebrow">Cornell University Library</span>
              <span className="libcard__title">{profile.first} {profile.last}</span>
            </div>
            <dl className="libcard__rows">
              <dt>major</dt><dd>Information Science, Systems &amp; Technology</dd>
              <dt>minor</dt><dd>Comparative Literature</dd>
              <dt>school</dt><dd>Cornell Engineering</dd>
              <dt>from</dt><dd>{profile.home}</dd>
              <dt>due</dt><dd>May 2029</dd>
            </dl>
            <Stamp top="checked out" bottom="2025" small style={{ right: 8, top: 6, transform: 'rotate(-14deg)' }} />
          </div>
        </div>

        <Paper className="letter">
          <Tape variant="masking" style={{ top: -12, right: 30, transform: 'rotate(6deg)' }} />
          <p className="letter__dear">Dear reader,</p>
          {letter.map((l) => <p key={l}>{l}</p>)}
          <p className="todo">{letterTodo}</p>
          <p className="letter__sign">{profile.first}</p>
          <WaxSeal letter={profile.first[0]} className="seal--small" style={{ right: 26, bottom: 22, transform: 'rotate(-8deg)' }} />
        </Paper>

        <div className="awards">
          <h3 className="eyebrow">honors</h3>
          {awards.map((a, i) => (
            <div key={a.title} className="award">
              <WaxSeal letter="★" className="seal--small" style={{ position: 'static', transform: `rotate(${i * 9 - 8}deg)` }} />
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
      <div className="envelope">
        <div className="envelope__flap" aria-hidden="true" />
        <WaxSeal letter={profile.first[0]} style={{ top: 34, left: '50%', marginLeft: -40 }} />
        <div className="envelope__body">
          <Heading script="Say" caps="hi" />
          <p>I&rsquo;m looking for internships and research in product, design and UI/UX. I&rsquo;d love to hear what you&rsquo;re working on.</p>
          <div className="envelope__mail">
            <span id="email" className="caption">{profile.email}</span>
            <button className="btn" onClick={copy}>{copied === 'copied' ? 'copied!' : copied === 'selected' ? 'selected, press Ctrl+C' : 'copy email'}</button>
          </div>
          <div className="envelope__links">
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </div>
    </section>
  );
}
