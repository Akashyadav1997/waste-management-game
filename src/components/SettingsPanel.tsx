import { useGameStore } from '../state/gameStore';

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header>
          <h2 id="settings-title">Settings</h2>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </header>
        <label className="setting-row">
          <span>
            <strong>Sound effects</strong>
            <small>Selection, success, retry and completion tones.</small>
          </span>
          <input type="checkbox" checked={settings.effects} onChange={(event) => updateSettings({ effects: event.target.checked })} />
        </label>
        <label className="setting-row slider-row">
          <span>
            <strong>Effects volume</strong>
            <small>{Math.round(settings.effectsVolume * 100)} percent</small>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.effectsVolume}
            onChange={(event) => updateSettings({ effectsVolume: Number(event.target.value) })}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>Narration</strong>
            <small>Speaks the chapter, each item you pick up, and the sorting result.</small>
          </span>
          <input type="checkbox" checked={settings.narration} onChange={(event) => updateSettings({ narration: event.target.checked })} />
        </label>
        <label className="setting-row slider-row">
          <span>
            <strong>Narration volume</strong>
            <small>{Math.round(settings.narrationVolume * 100)} percent</small>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.narrationVolume}
            onChange={(event) => updateSettings({ narrationVolume: Number(event.target.value) })}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>Kitchen ambience</strong>
            <small>Quiet local hum after audio is enabled.</small>
          </span>
          <input type="checkbox" checked={settings.ambience} onChange={(event) => updateSettings({ ambience: event.target.checked })} />
        </label>
        <label className="setting-row slider-row">
          <span>
            <strong>Ambience volume</strong>
            <small>{Math.round(settings.ambienceVolume * 100)} percent</small>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.ambienceVolume}
            onChange={(event) => updateSettings({ ambienceVolume: Number(event.target.value) })}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>Reduced motion</strong>
            <small>Limits camera shifts and item animation.</small>
          </span>
          <input type="checkbox" checked={settings.reducedMotion} onChange={(event) => updateSettings({ reducedMotion: event.target.checked })} />
        </label>
        <label className="setting-row">
          <span>
            <strong>Lower graphics</strong>
            <small>Reduces shadows and render resolution.</small>
          </span>
          <input type="checkbox" checked={settings.lowQuality} onChange={(event) => updateSettings({ lowQuality: event.target.checked })} />
        </label>
        <div className="settings-danger-zone">
          <h3>Progress Management</h3>
          <p>Resetting progress clears all unlocked chapters and returns to the beginning.</p>
          <button
            type="button"
            className="danger-button"
            aria-label="Reset progress"
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all saved progress? This will lock all chapters.')) {
                useGameStore.getState().resetProgress();
                onClose();
              }
            }}
          >
            Reset all saved progress
          </button>
        </div>
      </section>
    </div>
  );
}
