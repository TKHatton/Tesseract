import { useEffect, useRef } from 'react';
import CubePhysics from '../systems/CubePhysics';

const GameCanvas = ({
  phase,
  phaseState,
  onCellInteract,
  onPhase3Rotate,
  onFaceSelect,
  musicEngine,
  onPlayerInteract,
}) => {
  const containerRef = useRef(null);
  const physicsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    let disposed = false;
    let raf;

    const init = () => {
      if (disposed) return;
      if (!window.THREE) {
        raf = requestAnimationFrame(init);
        return;
      }
      const engine = new CubePhysics(containerRef.current, {
        onCellInteract: (target) => {
          onPlayerInteract?.();
          onCellInteract?.(target);
          musicEngine?.trigger('click', { index: target.index });
        },
        onPhase3Rotate: (face, direction) => {
          onPlayerInteract?.();
          onPhase3Rotate?.(face, direction);
          musicEngine?.trigger('rotate', { index: direction > 0 ? 2 : 4 });
        },
        onFaceSelect: (...args) => {
          onPlayerInteract?.();
          onFaceSelect?.(...args);
        },
        onRotate: ({ deltaX }) => {
          if (Math.abs(deltaX) > 0.002) {
            onPlayerInteract?.();
            musicEngine?.trigger('rotate', { index: Math.floor(Math.abs(deltaX) * 10) });
          }
        },
        onInteraction: () => {
          musicEngine?.resume();
          onPlayerInteract?.();
        },
      });
      physicsRef.current = engine;
      if (phaseState) {
        engine.setPhase(phase, phaseState);
      }
    };

    init();

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      physicsRef.current?.dispose();
      physicsRef.current = null;
    };
  }, [musicEngine, onCellInteract, onFaceSelect, onPhase3Rotate]);

  useEffect(() => {
    if (!physicsRef.current || !phaseState) return;
    physicsRef.current.setPhase(phase, phaseState);
  }, [phase, phaseState]);

  useEffect(() => {
    if (!physicsRef.current || !phaseState) return;
    physicsRef.current.updatePhaseState(phaseState);
  }, [phaseState]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
};

export default GameCanvas;
