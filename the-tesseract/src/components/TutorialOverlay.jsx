const TutorialOverlay = ({ config, onDismiss }) => {
  if (!config) return null;

  const {
    title,
    subtitle,
    lines = [],
    accent,
    dismissLabel = 'Got it',
  } = config;

  const handleContainerClick = () => {
    onDismiss?.();
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center px-6 py-10 bg-black/40"
      onClick={handleContainerClick}
      role="presentation"
    >
      <div
        className="pointer-events-auto max-w-xl w-full bg-black/80 text-white px-8 py-10 rounded-3xl border border-white/10 shadow-2xl space-y-5 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        {accent && <p className="text-cosmicGold uppercase tracking-[0.35em] text-xs">{accent}</p>}
        {title && <h2 className="text-3xl md:text-4xl font-semibold">{title}</h2>}
        {subtitle && <p className="text-base md:text-lg text-gray-300">{subtitle}</p>}
        <div className="space-y-3 text-sm md:text-base text-gray-100">
          {lines.map((line) => (
            <p key={line} className="leading-relaxed">
              {line}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={handleContainerClick}
          className="mt-4 inline-flex items-center justify-center px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 transition text-sm tracking-[0.2em]"
        >
          {dismissLabel.toUpperCase()}
        </button>
      </div>
    </div>
  );
};

export default TutorialOverlay;
