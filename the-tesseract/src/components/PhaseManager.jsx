import { useEffect } from 'react';

const PhaseManager = ({ active, fromPhase, toPhase, script = [], onComplete }) => {
  useEffect(() => {
    if (!active) return undefined;
    const timer = setTimeout(() => {
      onComplete?.();
    }, 7000);
    const gsap = window.gsap;
    if (gsap) {
      gsap.fromTo(
        '.phase-transition-line',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.4,
          duration: 1.2,
          ease: 'power2.out',
        },
      );
    }
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="transition-overlay absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-20">
      <p className="tracking-[0.3em] text-xs text-gray-400 mb-3">
        Transitioning Phase {fromPhase} → {toPhase}
      </p>
      <h2 className="text-4xl font-semibold mb-6">Reality Reshapes Itself</h2>
      <div className="space-y-4 max-w-3xl">
        {script.map((line) => (
          <p key={line} className="text-lg md:text-2xl phase-transition-line">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default PhaseManager;
