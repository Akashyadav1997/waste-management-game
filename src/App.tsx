import { useEffect, useMemo, useState } from 'react';
import { binScheme, classificationSource } from './data/bins';
import { useGameStore } from './state/gameStore';
import { chapters } from './data/chapters';
import { wasteItems } from './data/wasteItems';
import { CompletionCelebration } from './components/CompletionCelebration';
import { ChapterSelect } from './components/ChapterSelect';
import { GameScreen } from './components/GameScreen';
import { SettingsPanel } from './components/SettingsPanel';
import { audioController } from './game/audio';

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function App() {
  const screen = useGameStore((state) => state.screen);
  const hydrate = useGameStore((state) => state.hydrate);
  const startNew = useGameStore((state) => state.startNew);
  const continueGame = useGameStore((state) => state.continueGame);
  const saveAvailable = useGameStore((state) => state.saveAvailable);
  const settings = useGameStore((state) => state.settings);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const completedChapters = useGameStore((state) => state.completedChapters);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const webglAvailable = useMemo(hasWebGL, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (screen === 'title') {
    return (
      <main className="app-shell title-shell">
        <section className="title-scene" aria-labelledby="game-title">
          <div className="title-copy">
            <span className="eyebrow-pill">A waste-sorting adventure</span>
            <h1 id="game-title">Jyoti’s Clean World</h1>
            <p className="title-desc">
              Help Jyoti sort waste and make her home, school and neighbourhood cleaner.
            </p>
            <p className="learning-summary">{chapters.length} chapters · {wasteItems.length} everyday items · 4 kinds of waste</p>
            <div className="title-actions">
              <button
                type="button"
                className="lets-play-button"
                aria-label="Let's Play"
                onClick={() => {
                  audioController.unlock();
                  audioController.speak("Welcome to Jyoti’s Clean World! Let's help Jyoti sort waste and make her home cleaner.", settings);
                  startNew();
                }}
              >
                <span className="play-icon" aria-hidden="true">▶</span>
                <span>Let's Play</span>
              </button>

              {saveAvailable && (
                <button
                  type="button"
                  className="continue-button"
                  onClick={() => {
                    audioController.unlock();
                    continueGame();
                  }}
                >
                  Continue
                </button>
              )}

              <button
                type="button"
                className="settings-entry-button"
                onClick={() => setSettingsOpen(true)}
                aria-label="Game settings"
              >
                <span className="gear-icon">⚙</span>
                <span>Settings</span>
              </button>
            </div>
          </div>

          <div className="title-hero-frame">
            <img
              src="/assets/landing-hero.jpg"
              alt="Jyoti and Mum happily sorting kitchen waste into green wet and blue dry bins"
              className="hero-image"
              loading="eager"
            />
          </div>
        </section>

        <section className="learning-banner" aria-labelledby="learning-title">
          <div>
            <p className="eyebrow">Small habits. A cleaner neighbourhood.</p>
            <h2 id="learning-title">Learn it here. Use it every day.</h2>
            <p>From breakfast scraps to school litter, discover where everyday waste belongs.</p>
          </div>
          <ol className="learning-steps">
            <li><span>1</span> Pick an item</li>
            <li><span>2</span> Choose its bin</li>
            <li><span>3</span> Learn why it belongs</li>
          </ol>
        </section>

        <section className="landing-bins" aria-labelledby="landing-bins-title">
          <div className="landing-bins-heading">
            <h2 id="landing-bins-title">Meet the four bins</h2>
            <p>Your sorting guide for this adventure</p>
          </div>
          <div className="landing-bin-grid">
            {binScheme.map((bin) => (
              <article className="landing-bin-card" key={bin.id}>
                <svg className="landing-bin-icon" viewBox="0 0 56 64" aria-hidden="true">
                  <path d="M11 17h34l-3 42H14z" fill={bin.color} stroke="#173b2d" strokeOpacity=".18" strokeWidth="2" />
                  <rect x="7" y="10" width="42" height="8" rx="3" fill={bin.color} />
                  <path d="M22 10V6h12v4" fill="none" stroke={bin.color} strokeWidth="4" />
                  <rect x="19" y="28" width="18" height="20" rx="4" fill="white" />
                  <text x="28" y="42" textAnchor="middle" fontSize="12" fontWeight="800" fill="#173b2d">{bin.symbol}</text>
                </svg>
                <div>
                  <span className="landing-bin-color">{bin.colorName} bin</span>
                  <h3>{bin.shortLabel} waste</h3>
                  <p>{bin.examples[0]}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="landing-care-note">Learn to rinse packaging, wrap waste safely and ask an adult for help with hazardous items.</p>
        </section>

        <footer className="title-footer">
          <button
            type="button"
            className="info-pill-button"
            onClick={() => setInfoModalOpen(true)}
          >
            <span>ℹ️</span> Waste Guidelines & Parent Guide
          </button>
        </footer>

        {infoModalOpen && (
          <div className="modal-backdrop" role="presentation">
            <section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-modal-title">
              <header>
                <h2 id="info-modal-title">Waste Segregation Guidelines</h2>
                <button
                  type="button"
                  className="modal-close-button"
                  onClick={() => setInfoModalOpen(false)}
                  aria-label="Close information"
                >
                  ✕
                </button>
              </header>
              <div className="modal-body">
                <p><strong>Guidance source:</strong> {classificationSource.title}</p>
                <p>{classificationSource.summary}</p>
                <h3>Official References:</h3>
                <ul>
                  {classificationSource.urls.map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <footer>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setInfoModalOpen(false)}
                >
                  Got it!
                </button>
              </footer>
            </section>
          </div>
        )}

        {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      </main>
    );
  }

  if (screen === 'chapters') {
    return (
      <main className="app-shell">
        <TopBar onSettings={() => setSettingsOpen(true)} currentScreen="chapters" />
        <ChapterSelect />
        {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      </main>
    );
  }

  if (screen === 'complete') {
    return (
      <main className="app-shell celebration-shell">
        <CompletionCelebration
          completedChapters={completedChapters}
          reducedMotion={settings.reducedMotion}
          onReplay={() => useGameStore.getState().openChapters()}
          onReset={() => { if (window.confirm('Reset all saved progress?')) resetProgress(); }}
        />
        {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      </main>
    );
  }

  return (
    <main className="app-shell game-shell">
      <TopBar onSettings={() => setSettingsOpen(true)} currentScreen="game" />
      <GameScreen webglAvailable={webglAvailable} reducedMotion={settings.reducedMotion} />
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </main>
  );
}

function TopBar({
  onSettings,
  currentScreen,
}: {
  onSettings: () => void;
  currentScreen: 'chapters' | 'game';
}) {
  const openChapters = useGameStore((state) => state.openChapters);
  const openTitle = useGameStore((state) => state.openTitle);
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const toggleSound = () => {
    const isMuted = !settings.effects && !settings.narration;
    if (isMuted) {
      updateSettings({ effects: true, narration: true });
    } else {
      updateSettings({ effects: false, narration: false });
    }
  };

  const soundActive = settings.effects || settings.narration;

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        {currentScreen === 'game' ? (
          <button
            type="button"
            className="nav-action-button"
            onClick={() => {
              audioController.stopAll();
              openChapters();
            }}
            aria-label="Return to chapter selection"
          >
            <span className="arrow">←</span> Chapters
          </button>
        ) : (
          <button
            type="button"
            className="nav-action-button"
            onClick={() => {
              audioController.stopAll();
              openTitle();
            }}
            aria-label="Return to home screen"
          >
            <span className="arrow">←</span> Home
          </button>
        )}
      </div>

      <div className="top-bar-branding">
        <strong>Jyoti’s Clean World</strong>
        <span>A waste-sorting adventure</span>
      </div>

      <nav className="top-bar-controls" aria-label="Game controls">
        <button
          type="button"
          className="header-icon-button"
          onClick={toggleSound}
          aria-label={soundActive ? 'Mute audio' : 'Unmute audio'}
          title={soundActive ? 'Mute audio' : 'Unmute audio'}
        >
          {soundActive ? '🔊' : '🔇'}
        </button>

        <button
          type="button"
          className="header-icon-button"
          onClick={onSettings}
          aria-label="Open settings"
          title="Settings"
        >
          ⚙️
        </button>
      </nav>
    </header>
  );
}
