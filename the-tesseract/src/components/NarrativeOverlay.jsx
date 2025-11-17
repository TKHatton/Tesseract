const NarrativeOverlay = ({ messages = [], floatingTexts = [] }) => {
  const grouped = messages.reduce(
    (acc, message) => {
      const slot = acc[message.position] ? message.position : 'top';
      acc[slot].push(message);
      return acc;
    },
    { top: [], center: [], bottom: [] },
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col text-center px-6 py-6">
      <div className="space-y-3">
        {grouped.top.map((message) => (
          <p
            key={message.id}
            className="text-lg md:text-xl text-gray-200 drop-shadow-lg narrative-fade"
          >
            {message.text}
          </p>
        ))}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-3 max-w-2xl">
          {grouped.center.map((message) => (
            <p key={message.id} className="text-2xl md:text-3xl font-semibold narrative-fade">
              {message.text}
            </p>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {grouped.bottom.map((message) => (
          <p
            key={message.id}
            className="text-sm md:text-base text-gray-300 uppercase tracking-[0.2em] narrative-fade"
          >
            {message.text}
          </p>
        ))}
      </div>
      {floatingTexts.map((text) => (
        <div
          key={text.id}
          className="absolute text-xs text-gray-200 animate-floatSlow"
          style={{
            left: `${text.x * 100}%`,
            top: `${text.y * 100}%`,
          }}
        >
          {text.text}
        </div>
      ))}
    </div>
  );
};

export default NarrativeOverlay;
