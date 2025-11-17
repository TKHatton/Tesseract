const ClickIndicators = ({ visible, phase }) => {
  if (!visible) return null;

  const phaseMessage =
    phase === 3
      ? 'Select a fragment, then drag to rotate it.'
      : 'Drag to orbit, scroll to zoom, click glowing sections.';

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="tutorial-indicator drag">
        <div className="arrow" />
        <span className="label">Drag to orbit</span>
      </div>
      <div className="tutorial-indicator click">
        <div className="pulse" />
        <span className="label">{phaseMessage}</span>
      </div>
    </div>
  );
};

export default ClickIndicators;
