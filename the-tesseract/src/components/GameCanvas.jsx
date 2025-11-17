import { useEffect, useRef } from 'react';
import CubePhysics from '../systems/CubePhysics';

const GameCanvas = ({
  phase,
  phaseState,
  onCellInteract,
  onPhase3Rotate,
  onFaceSelect,
  musicEngine,
}) => {
  const containerRef = useRef(null);
  const physicsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const engine = new CubePhysics(containerRef.current, {
      onCellInteract: (target) => {
        onCellInteract?.(target);
        musicEngine?.trigger('click', { index: target.index });
      },
      onPhase3Rotate: (face, direction) => {
        onPhase3Rotate?.(face, direction);
        musicEngine?.trigger('rotate', { index: direction > 0 ? 2 : 4 });
      },
      onFaceSelect,
      onRotate: ({ deltaX }) => {
        if (Math.abs(deltaX) > 0.002) {
          musicEngine?.trigger('rotate', { index: Math.floor(Math.abs(deltaX) * 10) });
        }
      },
      onInteraction: () => musicEngine?.resume(),
    });
    physicsRef.current = engine;
    return () => {
      engine.dispose();
      physicsRef.current = null;
    };
  }, [musicEngine, onCellInteract, onFaceSelect, onPhase3Rotate]);

  useEffect(() => {
    if (!physicsRef.current || !phaseState) return;
    physicsRef.current.setPhase(phase, phaseState);
  }, [phase]);

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
