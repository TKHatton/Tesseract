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
  // Use refs to store callbacks to avoid recreating CubePhysics on every callback change
  const callbacksRef = useRef({
    onCellInteract,
    onPhase3Rotate,
    onFaceSelect,
    onPlayerInteract,
  });

  // Update callback refs whenever they change
  useEffect(() => {
    callbacksRef.current = {
      onCellInteract,
      onPhase3Rotate,
      onFaceSelect,
      onPlayerInteract,
    };
  }, [onCellInteract, onPhase3Rotate, onFaceSelect, onPlayerInteract]);

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
          callbacksRef.current.onPlayerInteract?.();
          callbacksRef.current.onCellInteract?.(target);
          musicEngine?.trigger('click', { index: target.index });
        },
        onPhase3Rotate: (face, direction) => {
          callbacksRef.current.onPlayerInteract?.();
          callbacksRef.current.onPhase3Rotate?.(face, direction);
          musicEngine?.trigger('rotate', { index: direction > 0 ? 2 : 4 });
        },
        onFaceSelect: (...args) => {
          callbacksRef.current.onPlayerInteract?.();
          callbacksRef.current.onFaceSelect?.(...args);
        },
        onRotate: ({ deltaX }) => {
          if (Math.abs(deltaX) > 0.002) {
            callbacksRef.current.onPlayerInteract?.();
            musicEngine?.trigger('rotate', { index: Math.floor(Math.abs(deltaX) * 10) });
          }
        },
        onInteraction: () => {
          musicEngine?.resume();
          callbacksRef.current.onPlayerInteract?.();
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
  }, [musicEngine]); // Only recreate when musicEngine changes

  useEffect(() => {
    if (!physicsRef.current || !phaseState) return;
    physicsRef.current.setPhase(phase, phaseState);
  }, [phase]); // Only rebuild scene when phase changes, not on every state update

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
