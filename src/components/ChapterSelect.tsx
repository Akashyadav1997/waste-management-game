import { chapters } from '../data/chapters';
import { useGameStore } from '../state/gameStore';
import { ChapterThumbnail } from './ChapterThumbnails';

export function ChapterSelect() {
  const unlocked = useGameStore((state) => state.unlockedChapters);
  const completed = useGameStore((state) => state.completedChapters);
  const startChapter = useGameStore((state) => state.startChapter);
  const openTitle = useGameStore((state) => state.openTitle);

  return (
    <section className="chapter-select" aria-labelledby="chapters-title">
      <div className="chapter-nav-bar">
        <button
          type="button"
          className="back-button"
          onClick={openTitle}
          aria-label="Back to landing screen"
        >
          <span className="arrow">←</span> Back to Home
        </button>
      </div>

      <div className="section-heading">
        <p className="eyebrow">Chapter Selection</p>
        <h1 id="chapters-title">Choose Jyoti's next stop</h1>
        <p className="subtitle">Each stop teaches important sorting skills for a cleaner home and city.</p>
      </div>

      <div className="chapter-grid">
        {chapters.map((chapter) => {
          const isUnlocked = unlocked.includes(chapter.id);
          const isComplete = completed.includes(chapter.id);
          const previousChapter = chapters.find((c) => c.order === chapter.order - 1);
          const unlockNotice = previousChapter
            ? `Complete Chapter ${previousChapter.order}: ${previousChapter.title} to unlock`
            : 'Locked';

          return (
            <article
              className={`chapter-card ${isComplete ? 'complete' : ''} ${!isUnlocked ? 'locked' : ''}`}
              key={chapter.id}
            >
              <div className="chapter-thumb-wrapper">
                <ChapterThumbnail scene={chapter.scene} title={chapter.title} />
                {isComplete && (
                  <div className="status-badge complete-badge" aria-label="Chapter completed">
                    <span className="badge-icon">✓</span> Completed
                  </div>
                )}
                {!isUnlocked && (
                  <div className="thumb-lock-overlay" aria-hidden="true">
                    <div className="lock-icon-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <div className="chapter-info">
                <span className="chapter-number">Chapter {chapter.order}</span>
                <h2>{chapter.title}</h2>
                <p className="chapter-objective">{chapter.objective}</p>
                {!isUnlocked && (
                  <div className="unlock-requirement">
                    <span className="lock-glyph">🔒</span>
                    <span>{unlockNotice}</span>
                  </div>
                )}
              </div>

              <div className="chapter-action-wrapper">
                {isUnlocked ? (
                  <button
                    type="button"
                    className={isComplete ? 'replay-button' : 'play-button'}
                    onClick={() => startChapter(chapter.id)}
                    aria-label={`${isComplete ? 'Replay' : 'Play'} Chapter ${chapter.order}: ${chapter.title}`}
                  >
                    {isComplete ? (
                      <>
                        <span className="btn-icon">↺</span> Replay Chapter
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">▶</span> Play Chapter
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="locked-button"
                    disabled
                    aria-label={`Chapter ${chapter.order} locked. ${unlockNotice}`}
                  >
                    <span className="lock-glyph">🔒</span> Locked
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
