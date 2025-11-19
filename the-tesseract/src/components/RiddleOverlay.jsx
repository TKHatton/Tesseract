import { useState, useEffect } from 'react';

const RiddleOverlay = ({ riddle, onSolve, phase }) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setAnswer('');
    setError('');
    setShowHint(false);
    setAttempts(0);
  }, [riddle]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    const isCorrect = onSolve(answer);
    if (!isCorrect) {
      setError('Not quite. The cosmos whispers another answer...');
      setAttempts((prev) => prev + 1);
      setAnswer('');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleHint = () => {
    setShowHint(true);
  };

  if (!riddle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-w-2xl w-full mx-4 p-8 bg-gradient-to-br from-indigo-950/90 to-purple-950/90 border-2 border-cosmicGold/30 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-sm uppercase tracking-[0.3em] text-cosmicGold/70 mb-2">
            Phase {phase} Gateway
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Riddle of the Tesseract</h2>
          <div className="text-gray-300 text-lg leading-relaxed italic">
            "{riddle.riddle}"
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Speak your answer..."
              className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cosmicGold/50 transition-colors text-center text-xl"
              autoFocus
            />
            {error && (
              <div className="mt-2 text-red-400 text-sm text-center animate-pulse">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              type="submit"
              className="px-8 py-3 bg-cosmicGold/20 hover:bg-cosmicGold/30 border border-cosmicGold/50 rounded-lg text-white font-semibold transition-all hover:scale-105"
            >
              Submit Answer
            </button>
            {attempts >= 2 && !showHint && riddle.hint && (
              <button
                type="button"
                onClick={handleHint}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white text-sm transition-all"
              >
                Request Hint
              </button>
            )}
          </div>

          {showHint && riddle.hint && (
            <div className="mt-4 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg text-blue-200 text-center animate-fadeIn">
              <span className="text-xs uppercase tracking-wider text-blue-400">Hint:</span>
              <div className="mt-1">{riddle.hint}</div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-gray-500 text-xs">
          Solve the riddle to proceed to the next phase
        </div>
      </div>
    </div>
  );
};

export default RiddleOverlay;
