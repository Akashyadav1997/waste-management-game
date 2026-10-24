import type { BinDefinition } from '../game/types';

export function BinGuide({ bin }: { bin: BinDefinition }) {
  return (
    <aside className="bin-guide" style={{ borderTopColor: bin.color }} aria-label={`${bin.label} bin guide`} role="status">
      <div className="bin-guide-heading">
        <span className="bin-guide-symbol" style={{ backgroundColor: bin.color, color: bin.textColor }} aria-hidden="true">{bin.symbol}</span>
        <div>
          <p className="bin-guide-color">{bin.colorName} bin</p>
          <h2>{bin.label}</h2>
        </div>
      </div>
      <p className="bin-guide-intro">What belongs here</p>
      <ul>{bin.examples.map((example) => <li key={example}>{example}</li>)}</ul>
      <p className="bin-guide-note">{bin.note}</p>
    </aside>
  );
}
