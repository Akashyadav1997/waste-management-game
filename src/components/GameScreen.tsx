import { useEffect, useMemo, useRef, useState } from 'react';
import { getChapter } from '../data/chapters';
import { destinations, getDestination } from '../data/bins';
import { getWasteItem } from '../data/wasteItems';
import { useGameStore } from '../state/gameStore';
import { audioController } from '../game/audio';
import type { Chapter } from '../game/types';
import { GameScene } from './three/GameScene';
import { ConfettiBurst } from './ConfettiBurst';

type Props = {
  webglAvailable: boolean;
  reducedMotion: boolean;
};

function playInstruction(chapter: Chapter): string {
  if (chapter.scene === 'kitchen') {
    return 'Help Mum sort the breakfast waste. Choose an item, then its bin.';
  }
  return chapter.objective;
}

function Avatar({ isJyoti }: { isJyoti: boolean }) {
  if (isJyoti) {
    return (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="2" />
        <circle cx="10" cy="18" r="5" fill="#1E1614" />
        <circle cx="30" cy="18" r="5" fill="#1E1614" />
        <ellipse cx="20" cy="20" rx="9" ry="10" fill="#9B6042" />
        <path d="M12 17 Q20 12 28 17 Q20 14 12 17 Z" fill="#1E1614" />
        <circle cx="17" cy="20" r="1.3" fill="#1E1614" />
        <circle cx="23" cy="20" r="1.3" fill="#1E1614" />
        <circle cx="17.4" cy="19.6" r="0.4" fill="#FFFFFF" />
        <circle cx="23.4" cy="19.6" r="0.4" fill="#FFFFFF" />
        <path d="M18 24 Q20 26 22 24" stroke="#881337" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="14" cy="22" r="1.5" fill="#FB7185" opacity="0.6" />
        <circle cx="26" cy="22" r="1.5" fill="#FB7185" opacity="0.6" />
        <path d="M14 30 Q20 28 26 30 L28 40 L12 40 Z" fill="#FBBF24" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="31" fill="#FFF6E8" stroke="#F3D7A1" strokeWidth="2" />
      <path d="M14 58c2-10 8-14 18-14s16 4 18 14" fill="#E25B6A" />
      <path d="M24 50h16l2 10H22l2-10Z" fill="#FFF8EE" />
      <circle cx="32" cy="28" r="13" fill="#C4845A" />
      <path d="M19 27c2-10 8-16 13-16s11 6 13 16c-3-3-8-5-13-5s-10 2-13 5Z" fill="#3A241C" />
      <circle cx="32" cy="16" r="5" fill="#3A241C" />
      <circle cx="40" cy="18" r="4" fill="#3A241C" />
      <circle cx="27" cy="29" r="1.7" fill="#1A120E" />
      <circle cx="37" cy="29" r="1.7" fill="#1A120E" />
      <circle cx="27.6" cy="28.4" r="0.5" fill="#FFFFFF" />
      <circle cx="37.6" cy="28.4" r="0.5" fill="#FFFFFF" />
      <circle cx="32" cy="25" r="1.2" fill="#D61F3A" />
      <path d="M28 34c1.4 1.6 2.6 2.2 4 2.2s2.6-.6 4-2.2" stroke="#9F1239" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="23" cy="32" r="2" fill="#E8888A" opacity="0.55" />
      <circle cx="41" cy="32" r="2" fill="#E8888A" opacity="0.55" />
      <circle cx="20" cy="30" r="1.4" fill="#E7B84A" />
      <circle cx="44" cy="30" r="1.4" fill="#E7B84A" />
    </svg>
  );
}

export function GameScreen({ webglAvailable, reducedMotion }: Props) {
  const chapterId = useGameStore((state) => state.chapterId);
  const status = useGameStore((state) => state.status);
  const completedItemIds = useGameStore((state) => state.completedItemIds);
  const selectedItemId = useGameStore((state) => state.selectedItemId);
  const sortedDestinations = useGameStore((state) => state.sortedDestinations);
  const selectItem = useGameStore((state) => state.selectItem);
  const submitDestination = useGameStore((state) => state.submitDestination);
  const closeFeedback = useGameStore((state) => state.closeFeedback);
  const goNext = useGameStore((state) => state.goNext);
  const feedback = useGameStore((state) => state.feedback);
  const settings = useGameStore((state) => state.settings);
  const [introIndex, setIntroIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(!webglAvailable);
  const [hoveredItemName, setHoveredItemName] = useState<string | undefined>();
  const [confettiActive, setConfettiActive] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const chapter = getChapter(chapterId);
  const previousStatus = useRef(status);
  const [trackedChapterId, setTrackedChapterId] = useState(chapterId);

  if (trackedChapterId !== chapterId) {
    setTrackedChapterId(chapterId);
    setIntroIndex(0);
  }

function getIntroSpokenText(chapter: Chapter, introIndex: number): string {
  if (chapter.id === 'kitchen' && introIndex === 0) {
    return "Hi, I'm Jyoti! Look, Mum is mixing breakfast waste in one bowl. Let's help her sort it into wet waste and dry waste!";
  }
  return chapter.intro[introIndex] ?? '';
}

  useEffect(() => {
    setMenuOpen(!webglAvailable);
    return () => {
      audioController.stopSpeech();
    };
  }, [webglAvailable]);

  // Cheerful girl voice speech synthesis for chapter narrative & instructions
  useEffect(() => {
    if (!chapter) return;
    const previous = previousStatus.current;
    previousStatus.current = status;
    const currentSettings = useGameStore.getState().settings;
    if (status === 'intro') {
      audioController.speak(getIntroSpokenText(chapter, introIndex), currentSettings);
      return;
    }
    if (status === 'playing' && previous === 'intro') {
      audioController.speak(playInstruction(chapter), currentSettings);
    }
  }, [chapter, introIndex, status]);

  useEffect(() => {
    audioController.setAmbience(settings);
    return () => audioController.stopAmbience();
  }, [settings]);

  useEffect(() => {
    if (status === 'chapterComplete') {
      audioController.complete(settings);
      setConfettiActive(true);
      window.setTimeout(() => setConfettiActive(false), 2400);
      audioController.speak(chapter?.completion ?? 'Chapter complete.', settings);
    }
  }, [chapter?.completion, settings, status]);

  // Auto-dismiss top-right feedback toast after 4 seconds so player is never blocked
  useEffect(() => {
    if (feedback && status !== 'chapterComplete') {
      const timer = window.setTimeout(() => {
        closeFeedback();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback, status, closeFeedback]);

  const chapterDestinations = useMemo(
    () => destinations.filter((destination) => chapter?.destinationIds.includes(destination.id)),
    [chapter],
  );

  if (!chapter) return null;

  const items = chapter.itemIds.map((itemId) => getWasteItem(itemId)).filter(Boolean);
  const progressText = `${completedItemIds.length} of ${chapter.itemIds.length}`;
  const selectedItem = selectedItemId ? getWasteItem(selectedItemId) : undefined;
  const caption = selectedItem
    ? `${selectedItem.displayName}. ${selectedItem.handling}`
    : status === 'playing'
      ? playInstruction(chapter)
      : chapter.intro[introIndex];

  const submit = (itemId: string, destinationId: string) => {
    const result = submitDestination(itemId, destinationId);
    if (result.correct) {
      // Crackers celebratory pops and sparkle chimes!
      audioController.success(settings);
      setConfettiActive(true);
      window.setTimeout(() => setConfettiActive(false), 1500);
    } else {
      audioController.retry(settings);
    }
    const destination = getDestination(destinationId);
    const spoken = result.correct && destination ? `${destination.label}. ${result.message}` : result.message;
    audioController.speak(spoken, settings);
  };

  const handleSelectItem = (itemId?: string) => {
    if (itemId && itemId !== selectedItemId && !completedItemIds.includes(itemId)) {
      audioController.selection(settings);
      const item = getWasteItem(itemId);
      if (item) audioController.speak(item.displayName, settings);
    }
    selectItem(itemId);
  };

  return (
    <section className={`play-layout ${webglAvailable ? '' : 'fallback-layout'}`}>
      <ConfettiBurst active={confettiActive} />

      <div className="game-view" aria-label={`${chapter.title} 3D scene`}>
        {webglAvailable ? (
          <GameScene
            chapter={chapter}
            onItemSelect={handleSelectItem}
            onDestination={submit}
            onItemHover={setHoveredItemName}
            reducedMotion={reducedMotion}
            sortedDestinations={sortedDestinations}
            onReady={() => setSceneReady(true)}
          />
        ) : (
          <div className="webgl-fallback">
            <h2>Simplified sorting mode</h2>
            <p>Your browser did not provide WebGL, so this chapter is available as accessible controls.</p>
          </div>
        )}
        {webglAvailable && !sceneReady && (
          <div className="scene-loading" role="status">
            Setting the scene…
          </div>
        )}
      </div>

      {/* Floating Objective Pill at Top Center */}
      <div className="progress-pill" aria-label={`${chapter.title}, ${progressText} sorted`}>
        <span>{chapter.title}</span>
        <strong>{progressText} sorted</strong>
      </div>

      {/* Item Hover Name Indicator */}
      {hoveredItemName && !selectedItemId && status === 'playing' && (
        <div className="hover-item-tooltip" aria-live="polite">
          <span className="tooltip-icon">👉</span>
          <span>Pick up: <strong>{hoveredItemName}</strong></span>
        </div>
      )}

      {/* Chapter Intro Card */}
      {status === 'intro' && (
        <section className="intro-card" role="dialog" aria-modal="false" aria-labelledby="chapter-intro-title">
          <p className="eyebrow">Chapter {chapter.order}</p>
          <h1 id="chapter-intro-title">{chapter.title}</h1>
          <p>{chapter.intro[introIndex]}</p>
          <div className="progress-track" aria-label={`Progress ${progressText}`}>
            <span style={{ width: `${(completedItemIds.length / chapter.itemIds.length) * 100}%` }} />
          </div>
          <div className="button-row">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                audioController.speak(getIntroSpokenText(chapter, introIndex), settings);
              }}
            >
              Replay narration
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                audioController.unlock();
                if (introIndex < chapter.intro.length - 1) {
                  setIntroIndex((current) => current + 1);
                } else {
                  useGameStore.setState({ status: 'playing' });
                }
              }}
            >
              {introIndex < chapter.intro.length - 1 ? 'Next' : "Let's help!"}
            </button>
          </div>
        </section>
      )}

      {/* Bottom Dialogue Bubble - Frosted Glass & Compact */}
      {status !== 'intro' && (
        <section className="bottom-dialogue" aria-live="polite">
          <div className="portrait" aria-hidden="true">
            <Avatar isJyoti={chapter.id !== 'kitchen' || Boolean(selectedItem)} />
          </div>
          <div className="dialogue-text">
            <strong>{chapter.id === 'kitchen' && !selectedItem ? 'Mum' : chapter.id === 'school' && !selectedItem ? 'Teacher' : 'Jyoti'}</strong>
            <p>{caption}</p>
          </div>
          <div className="dialogue-actions">
            <button
              type="button"
              className="secondary-button compact-button"
              onClick={() => selectedItem && audioController.speak(selectedItem.hint, settings)}
              disabled={!selectedItem}
            >
              Hint
            </button>
            <button
              type="button"
              className="secondary-button compact-button"
              onClick={() => audioController.speak(caption, settings)}
            >
              Replay
            </button>
            <button
              type="button"
              className="secondary-button compact-button"
              onClick={() => audioController.stopSpeech()}
            >
              Stop
            </button>
            <button
              type="button"
              className="primary-button compact-button sort-menu-button"
              onClick={() => setMenuOpen((current) => !current)}
            >
              {menuOpen ? 'Hide menu' : 'Sort menu'}
            </button>
          </div>
        </section>
      )}

      {/* Accessible Menu Drawer */}
      {status !== 'intro' && menuOpen && (
        <aside className="accessible-menu" aria-label="Accessible sorting controls">
          <div className="objective-panel">
            <h2>{chapter.title}</h2>
            <p>{chapter.objective}</p>
            {chapter.teacherLine && <blockquote>{chapter.teacherLine}</blockquote>}
            <div className="progress-track" aria-label={`Progress ${progressText}`}>
              <span style={{ width: `${(completedItemIds.length / chapter.itemIds.length) * 100}%` }} />
            </div>
          </div>
          <div className="sort-controls">
            <h2>Choose item</h2>
            <div className="item-list">
              {items.map((item) => {
                if (!item) return null;
                const done = completedItemIds.includes(item.id);
                const destinationLabel = done ? chapterDestinations.find((destination) => destination.id === sortedDestinations[item.id])?.shortLabel : undefined;
                return (
                  <button
                    type="button"
                    className={`item-button ${selectedItemId === item.id ? 'selected' : ''}`}
                    key={item.id}
                    disabled={done}
                    onClick={() => handleSelectItem(item.id)}
                  >
                    <span>{item.displayName}</span>
                    <small>{done ? `Sorted to ${destinationLabel ?? 'a bin'}` : 'Tap for hint or choose a destination'}</small>
                  </button>
                );
              })}
            </div>

            <h2>Choose destination</h2>
            <div className="destination-list">
              {chapterDestinations.map((destination) => (
                <button
                  type="button"
                  className="destination-button"
                  key={destination.id}
                  style={{ borderColor: destination.color }}
                  disabled={!selectedItemId}
                  onClick={() => selectedItemId && submit(selectedItemId, destination.id)}
                >
                  <b style={{ background: destination.color, color: destination.textColor }}>{destination.symbol}</b>
                  <span>{destination.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Non-blocking Top-Right Toast Notification */}
      {feedback && status !== 'chapterComplete' && (
        <div
          className={`feedback-toast toast-top-right ${feedback.correct ? 'toast-success' : 'toast-retry'}`}
          role="status"
        >
          <div className="toast-badge">
            {feedback.correct ? '🎉' : '💡'}
          </div>
          <div className="toast-message">
            <strong>{feedback.title}</strong>
            <p>{feedback.message}</p>
          </div>
          <button
            type="button"
            className="toast-dismiss-pill"
            onClick={() => closeFeedback()}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Chapter Completion Modal */}
      {status === 'chapterComplete' && (
        <div className="feedback-toast chapter-complete" role="status">
          <div className="celebration-badge">🏆</div>
          <h2>Chapter complete!</h2>
          <p>{chapter.completion}</p>
          <div className="button-row">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                audioController.stopSpeech();
                useGameStore.getState().replayChapter(chapter.id);
              }}
            >
              Replay
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                audioController.stopSpeech();
                goNext();
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
