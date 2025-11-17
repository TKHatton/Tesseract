import { useCallback, useEffect, useRef, useState } from 'react';
import GameCanvas from './components/GameCanvas';
import NarrativeOverlay from './components/NarrativeOverlay';
import HUD from './components/HUD';
import PhaseManager from './components/PhaseManager';
import {
  PHASES,
  MOVE_HINT_THRESHOLDS,
  NARRATIVE_SCRIPT,
  PHASE_TRANSITION_SCRIPT,
  PHASE2_AMBIENT_TEXT,
  PHASE3_MEMORIES,
} from './utils/constants';
import { formatTime, randomFromArray, createId } from './utils/helpers';
import { createPhase1State, cyclePhase1Color, checkPhase1Win } from './phases/Phase1';
import {
  createPhase2State,
  cyclePhase2Symbol,
  checkPhase2Win,
  buildAdjacencyMatches,
  getReactionLine,
} from './phases/Phase2';
import {
  createPhase3State,
  rotateFaceOrientation,
  countAlignedFaces,
  checkPhase3Win,
} from './phases/Phase3';
import MusicEngine from './systems/MusicEngine';
import NarrativeEngine from './systems/NarrativeEngine';

const createStateForPhase = (phase) => {
  if (phase === 1) return createPhase1State();
  if (phase === 2) return createPhase2State();
  return createPhase3State();
};

const HINTS = {
  1: 'Each face yearns for a single color. Cycle quadrants until harmony returns.',
  2: 'Complementary sigils glow when neighbors align. Let the light guide you.',
  3: 'Select a fragment, then drag to rotate it. Align every constellation shard.',
};

const App = () => {
  const [phase, setPhase] = useState(1);
  const [phaseState, setPhaseState] = useState(createPhase1State());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [hint, setHint] = useState('');
  const [transition, setTransition] = useState({ active: false, script: [], from: null, to: null });
  const [pendingPhase, setPendingPhase] = useState(null);
  const [messages, setMessages] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [stats, setStats] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [fragmentsAligned, setFragmentsAligned] = useState(0);
  const [phase3ConnectionIndex, setPhase3ConnectionIndex] = useState(0);
  const musicEngineRef = useRef(null);
  const narrativeRef = useRef(null);

  useEffect(() => {
    musicEngineRef.current = new MusicEngine();
    const narrative = new NarrativeEngine(setMessages);
    narrative.sequence(NARRATIVE_SCRIPT.opening, { position: 'center', gap: 2800 });
    narrative.push(NARRATIVE_SCRIPT.phase1.intro, { position: 'top' });
    narrativeRef.current = narrative;
    return () => {
      narrative.dispose();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (moves >= (MOVE_HINT_THRESHOLDS[phase] || Infinity)) {
      setHint(HINTS[phase]);
    } else {
      setHint('');
    }
  }, [moves, phase]);

  useEffect(() => {
    if (phase === 2) {
      const interval = setInterval(() => {
        narrativeRef.current?.push(randomFromArray(PHASE2_AMBIENT_TEXT), {
          position: 'bottom',
          duration: 4000,
        });
      }, 15000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [phase]);

  useEffect(() => {
    if (phase < 2) {
      setFloatingTexts([]);
      return undefined;
    }
    const pool = phase === 2 ? PHASE2_AMBIENT_TEXT : PHASE3_MEMORIES;
    const interval = setInterval(() => {
      setFloatingTexts((texts) => [
        ...texts.slice(-3),
        { id: createId('float'), text: randomFromArray(pool), x: Math.random(), y: Math.random() * 0.7 },
      ]);
    }, phase === 2 ? 10000 : 8000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === 1 && moves === 10) {
      narrativeRef.current?.push(NARRATIVE_SCRIPT.phase1.move10, { position: 'top' });
    }
    if (phase === 1 && moves === 30) {
      narrativeRef.current?.push(NARRATIVE_SCRIPT.phase1.move30, { position: 'top' });
    }
  }, [moves, phase]);

  const handlePhaseVictory = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      [phase]: { moves, time: formatTime(time) },
    }));
    musicEngineRef.current?.trigger('victory');
    if (phase === 1) {
      narrativeRef.current?.sequence(NARRATIVE_SCRIPT.phase1.win, { position: 'center', gap: 2600 });
    } else if (phase === 2) {
      narrativeRef.current?.sequence(NARRATIVE_SCRIPT.phase2.win, { position: 'center', gap: 2400 });
    } else {
      narrativeRef.current?.sequence(NARRATIVE_SCRIPT.phase3.finale, { position: 'center', gap: 3200 });
    }
    if (phase >= 3) return;
    setPendingPhase(phase + 1);
    setTransition({
      active: true,
      from: phase,
      to: phase + 1,
      script: PHASE_TRANSITION_SCRIPT[phase] || [],
    });
  }, [moves, phase, time]);

  const applyPhaseStateUpdate = (updater) => {
    let didComplete = false;
    setPhaseState((prev) => {
      const nextState = updater(prev);
      if (phase === 1 && checkPhase1Win(nextState)) {
        didComplete = true;
      }
      if (phase === 2 && checkPhase2Win(nextState.faces)) {
        didComplete = true;
      }
      if (phase === 3 && checkPhase3Win(nextState)) {
        didComplete = true;
      }
      return nextState;
    });
    if (didComplete) {
      handlePhaseVictory();
    }
  };

  const handleCellInteract = ({ face, index }) => {
    if (transition.active) return;
    setMoves((value) => value + 1);
    if (phase === 1) {
      applyPhaseStateUpdate((prev) => {
        const updatedFaces = { ...prev.faces, [face]: [...prev.faces[face]] };
        updatedFaces[face][index] = cyclePhase1Color(updatedFaces[face][index]);
        return { ...prev, faces: updatedFaces };
      });
    } else if (phase === 2) {
      applyPhaseStateUpdate((prev) => {
        const faces = { ...prev.faces, [face]: [...prev.faces[face]] };
        faces[face][index] = cyclePhase2Symbol(faces[face][index]);
        const adjacency = buildAdjacencyMatches(faces);
        if (adjacency.length) {
          const reaction = getReactionLine(adjacency[adjacency.length - 1].pair);
          narrativeRef.current?.push(reaction, { position: 'center', duration: 3000 });
          musicEngineRef.current?.trigger('match');
        }
        return { ...prev, faces, adjacency };
      });
    }
  };

  const handlePhase3Rotate = (faceKey, direction) => {
    if (transition.active) return;
    if (phase !== 3) return;
    applyPhaseStateUpdate((prev) => {
      const faces = rotateFaceOrientation(prev.faces, faceKey, direction);
      const aligned = countAlignedFaces(faces);
      setFragmentsAligned(aligned);
      if (aligned > phase3ConnectionIndex && aligned <= NARRATIVE_SCRIPT.phase3.connection.length) {
        const line = NARRATIVE_SCRIPT.phase3.connection[aligned - 1];
        narrativeRef.current?.push(line, { position: 'center', duration: 3000 });
        setPhase3ConnectionIndex(aligned);
      }
      return { ...prev, faces };
    });
  };

  const completeTransition = useCallback(() => {
    if (!pendingPhase) return;
    const nextPhase = pendingPhase;
    setTransition({ active: false, script: [], from: null, to: null });
    setPhase(nextPhase);
    const nextState = createStateForPhase(nextPhase);
    setPhaseState(nextState);
    setMoves(0);
    setTime(0);
    setStartTime(Date.now());
    setHint('');
    setFragmentsAligned(0);
    setPhase3ConnectionIndex(0);
    musicEngineRef.current?.setPhase(nextPhase);
    if (nextPhase === 2) {
      narrativeRef.current?.sequence(NARRATIVE_SCRIPT.phase2.intro, { position: 'center', gap: 2400 });
    }
    if (nextPhase === 3) {
      narrativeRef.current?.sequence(NARRATIVE_SCRIPT.phase3.intro, { position: 'center', gap: 2400 });
    }
    setPendingPhase(null);
  }, [pendingPhase]);

  const handleReset = useCallback(() => {
    const snapshot = createStateForPhase(phase);
    setPhaseState(snapshot);
    setMoves(0);
    setTime(0);
    setStartTime(Date.now());
    setHint('');
    setFragmentsAligned(0);
    setPhase3ConnectionIndex(0);
  }, [phase]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      musicEngineRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const handleFaceSelect = () => {
    if (phase === 3) {
      const memory = randomFromArray(PHASE3_MEMORIES);
      narrativeRef.current?.push(memory, { position: 'top', duration: 3200 });
    }
  };

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'r' || event.key === 'R') {
        handleReset();
      }
      if (event.key === 'm' || event.key === 'M') {
        handleToggleMute();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleReset, handleToggleMute]);

  const phaseMeta = PHASES[phase - 1];

  useEffect(() => {
    musicEngineRef.current?.setMuted(isMuted);
  }, [isMuted]);

  return (
    <div className={`h-full w-full relative overflow-hidden ${phaseMeta.backgroundClass}`}>
      <GameCanvas
        phase={phase}
        phaseState={phaseState}
        onCellInteract={handleCellInteract}
        onPhase3Rotate={handlePhase3Rotate}
        onFaceSelect={handleFaceSelect}
        musicEngine={musicEngineRef.current}
      />
      <NarrativeOverlay messages={messages} floatingTexts={floatingTexts} />
      <HUD
        phase={phase}
        phaseLabel={`Phase ${phase}: ${phaseMeta.name}`}
        subtitle={phaseMeta.subtitle}
        moves={moves}
        time={time}
        hint={hint}
        onReset={handleReset}
        onToggleMute={handleToggleMute}
        isMuted={isMuted}
        stats={stats}
        fragmentsAligned={fragmentsAligned}
      />
      <PhaseManager
        active={transition.active}
        fromPhase={transition.from}
        toPhase={transition.to}
        script={transition.script}
        onComplete={completeTransition}
      />
    </div>
  );
};

export default App;
