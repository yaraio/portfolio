import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { PaperFilters } from './components/Deco';
import { Hero, Work, Experience, About, Contact } from './components/Sections';
import { profile } from './data/content';
import { useSheet } from './paper/useSheet';
import { hasVideo } from './paper/video';
import FontPicker from './components/FontPicker';

// three.js only loads when the intro plays. With public/paper/unwrap.mp4 the intro is
// the filmed paper ball; without it, the 3D one.
const Intro = lazy(() => import('./components/Intro'));
const VideoIntro = lazy(() => import('./components/VideoIntro'));

function shouldPlayIntro() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  const q = new URLSearchParams(location.search);
  if (q.has('intro') || q.has('introAt')) return true; // ?intro forces a replay
  try {
    if (sessionStorage.getItem('unfolded')) return false;
    sessionStorage.setItem('unfolded', '1');
  } catch { /* storage blocked: just play it */ }
  return true;
}

const PLAY_INTRO = shouldPlayIntro();

export default function App() {
  const [intro, setIntro] = useState(PLAY_INTRO);
  const sheet = useSheet();
  const done = useCallback(() => setIntro(false), []);
  const [video, setVideo] = useState<boolean | null>(null);
  useEffect(() => { hasVideo().then(setVideo); }, []);

  // the page sits still under the paper while it unfolds
  useEffect(() => {
    document.documentElement.classList.toggle('is-unfolding', intro);
    if (intro) window.scrollTo(0, 0);
  }, [intro]);

  const sheetStyle = sheet
    ? sheet.photo
      ? { backgroundImage: `url(${sheet.bakeURL})`, backgroundSize: '100% auto', backgroundRepeat: 'repeat-y' }
      : { backgroundImage: `url(${sheet.grainURL}), url(${sheet.bakeURL})`, backgroundSize: '256px 256px, 100% auto' }
    : undefined;

  return (
    <div className={`sheet${sheet ? ' sheet--ready' : ''}`} style={sheetStyle}>
      <PaperFilters />
      <nav className="nav" aria-label="Sections">
        <a className="nav__sig" href="#top">{profile.first}</a>
        <div className="nav__links">
          <a href="#work">work</a>
          <a href="#experience">experience</a>
          <a href="#about">about</a>
          <a href="#contact">say hi</a>
        </div>
      </nav>
      <main className="page">
        <Hero sheet={sheet} />
        <Work />
        <Experience />
        <About />
        <Contact />
      </main>
      <footer className="footer">
        <span className="caption">made by hand (and React) by {profile.first} {profile.last}, 2026</span>
        <button className="linkish caption" onClick={() => setIntro(true)}>crumple it up again</button>
      </footer>
      {import.meta.env.VITE_FONT_PICKER && <FontPicker />}
      {intro && (
        <Suspense fallback={<div className="intro" />}>
          {video === null ? <div className="intro" /> : video ? <VideoIntro onDone={done} /> : <Intro sheet={sheet} onDone={done} />}
        </Suspense>
      )}
    </div>
  );
}
