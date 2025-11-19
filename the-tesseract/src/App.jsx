import { useCallback, useEffect, useRef, useState } from 'react';
import GameCanvas from './components/GameCanvas';
import NarrativeOverlay from './components/NarrativeOverlay';
import HUD from './components/HUD';
import PhaseManager from './components/PhaseManager';
import TutorialOverlay from './components/TutorialOverlay';
import ClickIndicators from './components/ClickIndicators';
import RiddleOverlay from './components/RiddleOverlay';
import { generateRiddle, validateAnswer } from './services/riddleService';
import {
  PHASES,
  MOVE_HINT_THRESHOLDS,
  NARRATIVE_SCRIPT,
  PHASE_TRANSITION_SCRIPT,
  PHASE2_AMBIENT_TEXT,
  PHASE3_MEMORIES,
} from './utils/constants';
import { formatTime, randomFromArray, createId } from './utils/helpers';
import {
  createPhase1State,
  cyclePhase1Color,
  checkPhase1Win,
  isPhase1FaceAligned,
} from './phases/Phase1';
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

const CONTROL_TUTORIAL = {
  title: 'Tesseract Controls',
  subtitle: 'Drag anywhere to orbit the camera, and scroll to zoom.',
  lines: [
    'Click glowing quadrants/sigils to change them.',
    'Six faces, four tiles each - restore the pattern on every side.',
    'Need a refresher? Tap the ? button anytime.',
  ],
  accent: 'Controls',
  buttonLabel: 'Got It',
};

const PHASE_INTRO_COPY = {
  1: {
    title: 'Phase I - Awakening',
    subtitle: 'Unify each visible face with a single color to restore Harmony.',
    lines: ['Colors cycle in this order: Red -> Blue -> Green -> Purple.'],
  },
  2: {
    title: 'Phase II - Resonance',
    subtitle: 'Align complementary sigils so golden connections bloom across every edge.',
    lines: ['Watch for glowing beams: Tree + Water, Fire + Wind, Star + Eye, Spiral + Infinity.'],
  },
  3: {
    title: 'Phase III - Convergence',
    subtitle: 'Select each floating fragment, rotate it, and rebuild the constellation.',
    lines: ['Lightning will arc when fragments remember their place.'],
  },
};

const CONTEXT_HINTS = {
  1: 'Focus on a single face. Make all four quadrants the same color before moving on.',
  2: 'Spin the cube and look for dim edges. Complementary symbols must sit side-by-side.',
  3: 'Select a fragment, drag horizontally, and watch for the Phoenix constellation to line up.',
};

const CONTEXT_MOVE_DELAY = 20;

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
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [phaseIntroSeen, setPhaseIntroSeen] = useState({ 1: false, 2: false, 3: false });
  const [movesSinceProgress, setMovesSinceProgress] = useState(0);
  const [lastContextHintStep, setLastContextHintStep] = useState(0);
  const [showIndicators, setShowIndicators] = useState(true);
  const [tutorialDismissed, setTutorialDismissed] = useState(true);
  const [movesSinceTutorialDismiss, setMovesSinceTutorialDismiss] = useState(0);
  const [currentRiddle, setCurrentRiddle] = useState(null);
  const [riddleActive, setRiddleActive] = useState(false);
  const musicEngineRef = useRef(null);
  const narrativeRef = useRef(null);
  const controlTimerRef = useRef(null);

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

  const openControlsTutorial = useCallback(
    (variant = 'help') => {
      setTutorialDismissed(false);
      setMovesSinceTutorialDismiss(0);
      setShowIndicators(true);
      setActiveTutorial({ type: 'controls', variant });
    },
    [],
  );

  // Removed automatic tutorial popup - users can click the ? button when ready
  // useEffect(() => {
  //   controlTimerRef.current = setTimeout(() => {
  //     openControlsTutorial('opening');
  //   }, 4200);
  //   return () => clearTimeout(controlTimerRef.current);
  // }, [openControlsTutorial]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (!tutorialDismissed || movesSinceTutorialDismiss < 20) {
      setHint('');
      return;
    }
    if (moves >= (MOVE_HINT_THRESHOLDS[phase] || Infinity)) {
      setHint(HINTS[phase]);
    } else {
      setHint('');
    }
  }, [moves, phase, tutorialDismissed, movesSinceTutorialDismiss]);

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

  useEffect(() => {
    if (activeTutorial) return;
    if (!tutorialDismissed || movesSinceTutorialDismiss < CONTEXT_MOVE_DELAY) return;
    if (movesSinceProgress >= CONTEXT_MOVE_DELAY && movesSinceProgress - lastContextHintStep >= CONTEXT_MOVE_DELAY) {
      const hint = CONTEXT_HINTS[phase];
      if (hint) {
        setActiveTutorial({ type: 'context', message: hint });
        setLastContextHintStep(movesSinceProgress);
      }
    }
  }, [
    activeTutorial,
    movesSinceProgress,
    lastContextHintStep,
    phase,
    tutorialDismissed,
    movesSinceTutorialDismiss,
  ]);

  const registerProgress = useCallback(() => {
    setMovesSinceProgress(0);
    setLastContextHintStep(0);
    setShowIndicators(false);
    setActiveTutorial((current) => (current?.type === 'context' ? null : current));
  }, []);

  const handlePhaseVictory = useCallback(async () => {
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

    // Load riddle before allowing phase transition
    setPendingPhase(phase + 1);
    setTimeout(async () => {
      const riddle = await generateRiddle(phase + 1);
      setCurrentRiddle(riddle);
      setRiddleActive(true);
    }, phase === 1 ? 3000 : 2800); // Delay for narrative to finish
  }, [moves, phase, time]);

  const applyPhaseStateUpdate = useCallback((updater) => {
    let didComplete = false;
    let progressed = false;
    setPhaseState((prev) => {
      const result = updater(prev);
      const nextState = result?.state ?? result;
      if (result?.progress) {
        progressed = true;
      }
      if (phase === 1) {
        const won = checkPhase1Win(nextState);
        console.log('Phase 1 win check:', won, 'State:', nextState);
        if (won) {
          didComplete = true;
        }
      }
      if (phase === 2 && checkPhase2Win(nextState.faces)) {
        didComplete = true;
      }
      if (phase === 3 && checkPhase3Win(nextState)) {
        didComplete = true;
      }
      return nextState;
    });
    if (progressed) {
      registerProgress();
    }
    if (didComplete) {
      handlePhaseVictory();
    }
  }, [phase, registerProgress, handlePhaseVictory]);

  const handleCellInteract = useCallback(({ face, index }) => {
    if (transition.active) return;
    setMoves((value) => value + 1);
    setMovesSinceProgress((value) => value + 1);
    if (tutorialDismissed) {
      setMovesSinceTutorialDismiss((value) => value + 1);
    }
    setShowIndicators(false);
    if (phase === 1) {
      applyPhaseStateUpdate((prev) => {
        const updatedFaces = { ...prev.faces, [face]: [...prev.faces[face]] };
        updatedFaces[face][index] = cyclePhase1Color(updatedFaces[face][index]);
        const wasAligned = isPhase1FaceAligned(face, prev.faces[face]);
        const nowAligned = isPhase1FaceAligned(face, updatedFaces[face]);
        return { state: { ...prev, faces: updatedFaces }, progress: !wasAligned && nowAligned };
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
        const prevAdjCount = prev.adjacency?.length || 0;
        return {
          state: { ...prev, faces, adjacency },
          progress: adjacency.length > prevAdjCount,
        };
      });
    }
  }, [transition.active, tutorialDismissed, phase, applyPhaseStateUpdate]);

  const handlePhase3Rotate = useCallback((faceKey, direction) => {
    if (transition.active) return;
    if (phase !== 3) return;
    setMoves((value) => value + 1);
    setMovesSinceProgress((value) => value + 1);
    if (tutorialDismissed) {
      setMovesSinceTutorialDismiss((value) => value + 1);
    }
    setShowIndicators(false);
    applyPhaseStateUpdate((prev) => {
      const faces = rotateFaceOrientation(prev.faces, faceKey, direction);
      const aligned = countAlignedFaces(faces);
      setFragmentsAligned(aligned);
      if (aligned > phase3ConnectionIndex && aligned <= NARRATIVE_SCRIPT.phase3.connection.length) {
        const line = NARRATIVE_SCRIPT.phase3.connection[aligned - 1];
        narrativeRef.current?.push(line, { position: 'center', duration: 3000 });
        setPhase3ConnectionIndex(aligned);
      }
      const previousAligned = countAlignedFaces(prev.faces);
      return { state: { ...prev, faces }, progress: aligned > previousAligned };
    });
  }, [transition.active, phase, tutorialDismissed, phase3ConnectionIndex, applyPhaseStateUpdate]);

  const handleRiddleSolve = useCallback(
    (answer) => {
      if (!currentRiddle) return false;
      const isCorrect = validateAnswer(answer, currentRiddle.answer);
      if (isCorrect) {
        setRiddleActive(false);
        setCurrentRiddle(null);
        // Start phase transition after riddle is solved
        setTimeout(() => {
          setTransition({
            active: true,
            from: phase,
            to: pendingPhase,
            script: PHASE_TRANSITION_SCRIPT[phase] || [],
          });
        }, 500);
      }
      return isCorrect;
    },
    [currentRiddle, phase, pendingPhase],
  );

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
    setMovesSinceProgress(0);
    setLastContextHintStep(0);
    setShowIndicators(true);
    setMovesSinceTutorialDismiss(0);
    setTutorialDismissed(true);
    setMovesSinceTutorialDismiss(0);
    setTutorialDismissed(true);
    musicEngineRef.current?.setPhase(nextPhase);
    if (nextPhase === 2) {
      narrativeRef.current?.sequence(NARRATIVE_SCRIPT.phase2.intro, { position: 'center', gap: 2400 });
    }
    if (nextPhase === 3) {
      narrativeRef.current?.sequence(NARRATIVE_SCRIPT.phase3.intro, { position: 'center', gap: 2400 });
    }
    if (!phaseIntroSeen[nextPhase]) {
      setTimeout(() => {
        setActiveTutorial({ type: 'phase', phase: nextPhase });
      }, 2400);
    }
    setPendingPhase(null);
  }, [pendingPhase, phaseIntroSeen]);

  const handleReset = useCallback(() => {
    const snapshot = createStateForPhase(phase);
    setPhaseState(snapshot);
    setMoves(0);
    setTime(0);
    setStartTime(Date.now());
    setHint('');
    setFragmentsAligned(0);
    setPhase3ConnectionIndex(0);
    setMovesSinceProgress(0);
    setLastContextHintStep(0);
    setShowIndicators(true);
    setMovesSinceTutorialDismiss(0);
    setTutorialDismissed(true);
    setActiveTutorial((current) => (current?.type === 'context' ? null : current));
  }, [phase]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      musicEngineRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const handleFaceSelect = useCallback(() => {
    if (phase === 3) {
      const memory = randomFromArray(PHASE3_MEMORIES);
      narrativeRef.current?.push(memory, { position: 'top', duration: 3200 });
    }
  }, [phase]);

  const handlePlayerInteract = useCallback(() => {
    setShowIndicators(false);
  }, []);

  const dismissTutorial = useCallback(() => {
    if (!activeTutorial) return;
    if (activeTutorial.type === 'controls') {
      setActiveTutorial(null);
      setTutorialDismissed(true);
      setMovesSinceTutorialDismiss(0);
      if (!phaseIntroSeen[phase]) {
        setTimeout(() => {
          setActiveTutorial({ type: 'phase', phase });
        }, 400);
      }
      return;
    }
    if (activeTutorial.type === 'phase') {
      setPhaseIntroSeen((prev) => ({ ...prev, [activeTutorial.phase]: true }));
      setActiveTutorial(null);
      return;
    }
    if (activeTutorial.type === 'context') {
      setActiveTutorial(null);
      setLastContextHintStep(movesSinceProgress);
      setMovesSinceProgress(0);
    }
  }, [activeTutorial, phaseIntroSeen, phase, movesSinceProgress]);

  const tutorialConfig = (() => {
    if (!activeTutorial) return null;
    if (activeTutorial.type === 'controls') {
      return CONTROL_TUTORIAL;
    }
    if (activeTutorial.type === 'phase') {
      const copy = PHASE_INTRO_COPY[activeTutorial.phase];
      if (!copy) return null;
      return { ...copy, accent: `Phase ${activeTutorial.phase} Briefing` };
    }
    if (activeTutorial.type === 'context') {
      return {
        title: 'Hint',
        subtitle: null,
        lines: [activeTutorial.message || CONTEXT_HINTS[phase]],
        accent: 'Need a nudge?',
        dismissLabel: 'Understood',
      };
    }
    return null;
  })();

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
        onPlayerInteract={handlePlayerInteract}
      />
      <img
        src="/logo.png"
        alt="The Tesseract"
        className="absolute top-4 left-4 z-50 h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
      />
      <button
        type="button"
        onClick={() => openControlsTutorial('help')}
        className="absolute top-4 right-4 z-50 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-lg font-bold transition-all hover:scale-110"
        title="Instructions"
      >
        ?
      </button>
      <ClickIndicators visible={showIndicators && !activeTutorial} phase={phase} />
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
      <TutorialOverlay config={tutorialConfig} onDismiss={dismissTutorial} />
      {riddleActive && currentRiddle && (
        <RiddleOverlay riddle={currentRiddle} onSolve={handleRiddleSolve} phase={pendingPhase} />
      )}
    </div>
  );
};

export default App;




