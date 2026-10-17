import { useEffect, useMemo, useState } from 'react';
import { classificationSource } from './data/bins';
import { useGameStore } from './state/gameStore';
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
        <section className="celebration">
          <span className="eyebrow-pill">All chapters complete</span>
          <h1>Jyoti's neighbourhood is cleaner!</h1>
          <p>
            You completed all {completedChapters.length} chapters! Waste reached separated collection, drains stayed clearer,
            and unsafe tasks were handled by trained adults.
          </p>
          <div className="title-actions">
            <button
              type="button"
              className="lets-play-button"
              onClick={() => useGameStore.getState().openChapters()}
            >
              Replay chapters
            </button>
            <button
              type="button"
              className="continue-button"
              onClick={() => {
                if (window.confirm('Reset all saved progress?')) resetProgress();
              }}
            >
              Reset progress
            </button>
          </div>
        </section>
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
