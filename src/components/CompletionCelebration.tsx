import { useEffect, useState } from 'react';
import { chapters } from '../data/chapters';
import { ConfettiBurst } from './ConfettiBurst';

export function CompletionCelebration({ completedChapters, reducedMotion, onReplay, onReset }: {
  completedChapters: string[];
  reducedMotion: boolean;
  onReplay: () => void;
  onReset: () => void;
}) {
  const [paused, setPaused] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const motionAllowed = !reducedMotion && !systemReducedMotion;

  return (
    <>
      <ConfettiBurst active={motionAllowed && !paused} repeat />
      <section className="celebration" aria-labelledby="completion-title">
        <div className="champion-award">
          <span className="award-stars" aria-hidden="true">✦ ★ ✦</span>
          <svg viewBox="0 0 180 200" className="champion-medal" aria-hidden="true">
            <path d="M48 112 31 192l51-27 21 14 29-67" fill="#15803d" />
            <path d="m97 113 20 78 20-20 24 7-22-78" fill="#2563eb" />
            <circle cx="90" cy="78" r="68" fill="#fbbf24" stroke="#e9a318" strokeWidth="7" />
            <circle cx="90" cy="78" r="54" fill="#fff6cb" stroke="#fffdf0" strokeWidth="3" />
            <path d="m90 37 12 25 28 4-20 20 5 28-25-13-25 13 5-28-20-20 28-4Z" fill="#15803d" />
            <path d="m77 77 9 9 18-19" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <strong>Clean-world champion</strong>
          <span>A little care. A big difference.</span>
        </div>
        <div className="celebration-copy">
          <span className="eyebrow-pill">All chapters complete</span>
          <h1 id="completion-title">Jyoti’s neighbourhood is cleaner!</h1>
          <p>You did it! You helped Jyoti sort everyday waste, keep drains clear and learn when to ask an adult for help.</p>
          <div className="completion-stats">
            <div><strong>{completedChapters.length}/{chapters.length}</strong><span>chapters completed</span></div>
            <div><strong>4</strong><span>waste types explored</span></div>
          </div>
          <div className="title-actions">
            <button type="button" className="lets-play-button" onClick={onReplay}>Replay chapters</button>
            <button type="button" className="continue-button" onClick={onReset}>Reset progress</button>
          </div>
        </div>
        <div className="completed-journey">
          <h2>Your clean-world journey</h2>
          <ul>{chapters.filter((chapter) => completedChapters.includes(chapter.id)).map((chapter) => (
            <li key={chapter.id}><span aria-hidden="true">✓</span> {chapter.title}</li>
          ))}</ul>
        </div>
      </section>
      {motionAllowed && <button type="button" className="celebration-toggle" onClick={() => setPaused(!paused)}>{paused ? 'Resume celebration' : 'Pause celebration'}</button>}
    </>
  );
}
