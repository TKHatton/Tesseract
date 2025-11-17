import { formatTime } from '../utils/helpers';

const HUD = ({
  phase,
  phaseLabel,
  subtitle,
  moves,
  time,
  hint,
  onReset,
  onToggleMute,
  isMuted,
  stats = {},
  fragmentsAligned = 0,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 pointer-events-auto">
      <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.2em] text-gray-300">
          <span className="text-lg font-semibold text-white">{phaseLabel}</span>
          <span className="text-gray-400">{subtitle}</span>
          <span className="ml-auto">Moves: {moves}</span>
          <span>Time: {formatTime(time)}</span>
          {phase === 3 && <span>Fragments aligned: {fragmentsAligned}/6</span>}
        </div>
        {hint && (
          <div className="text-center text-cosmicGold text-base animate-pulseGlow">
            {hint}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm tracking-wide"
          >
            Reset (R)
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm tracking-wide"
          >
            {isMuted ? 'Unmute (M)' : 'Mute (M)'}
          </button>
          <div className="ml-auto flex gap-6 text-xs text-gray-400">
            {Object.entries(stats).map(([phaseIndex, data]) => (
              <div key={phaseIndex}>
                Phase {phaseIndex}: {data.moves ?? '--'} moves • {data.time ?? '--'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
