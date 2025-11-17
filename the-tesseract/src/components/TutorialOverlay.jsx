const TutorialOverlay = ({ config, onDismiss }) => {
  if (!config) return null;

  const { title, subtitle, lines = [], accent, dismissLabel = 'Click anywhere to continue' } = config;

  return (
    <div
      className="absolute inset-0 z-30 bg-black/80 text-white flex items-center justify-center px-6 py-10 text-center cursor-pointer"
      onClick={onDismiss}
      role="presentation"
    >
      <div className="max-w-3xl space-y-5">
        {accent && <p className="text-cosmicGold uppercase tracking-[0.4em] text-xs">{accent}</p>}
        {title && <h2 className="text-3xl md:text-4xl font-semibold">{title}</h2>}
        {subtitle && <p className="text-lg text-gray-200">{subtitle}</p>}
        <div className="space-y-3 text-base md:text-lg text-gray-100">
          {lines.map((line) => (
            <p key={line} className="leading-relaxed">
              {line}
            </p>
          ))}
        </div>
        <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{dismissLabel}</p>
      </div>
    </div>
  );
};

export default TutorialOverlay;
