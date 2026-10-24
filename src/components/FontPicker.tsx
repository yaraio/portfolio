import { FONTS, PAIRINGS } from '../fonts';

// Only in preview builds (VITE_FONT_PICKER=1): try each font pairing on the real page.
export default function FontPicker() {
  const choose = (k: string) => {
    try { localStorage.setItem('pairing', k); } catch { /* storage blocked */ }
    location.reload();
  };
  return (
    <div className="fontpicker" role="group" aria-label="Try a font pairing">
      <span>fonts</span>
      {Object.entries(PAIRINGS).map(([k, p]) => (
        <button key={k} className={p === FONTS ? 'is-on' : ''} onClick={() => choose(k)} title={p.label}>{k.toUpperCase()}</button>
      ))}
      <em>{FONTS.label}</em>
    </div>
  );
}
