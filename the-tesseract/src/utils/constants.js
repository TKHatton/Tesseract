export const PHASES = [
  {
    id: 1,
    name: 'Awakening',
    subtitle: 'The Void Remembers',
    backgroundClass: 'phase-gradient-1',
    particleColor: '#d4f0ff',
    targetFaces: {
      front: '#8B4049',
      right: '#5B7C5A',
      left: '#6B5B7C',
      back: '#4A5B7C',
      top: '#8B4049',
      bottom: '#4A5B7C',
    },
  },
  {
    id: 2,
    name: 'Resonance',
    subtitle: 'The Garden Grows',
    backgroundClass: 'phase-gradient-2',
    particleColor: '#FFD700',
  },
  {
    id: 3,
    name: 'Convergence',
    subtitle: 'The Universe Wakes',
    backgroundClass: 'phase-gradient-3',
    particleColor: '#00BFFF',
  },
];

export const PHASE1_COLORS = ['#8B4049', '#4A5B7C', '#5B7C5A', '#6B5B7C'];

export const SYMBOLS = [
  { id: 'tree', label: 'Tree', glyph: '\uD83C\uDF33' },
  { id: 'water', label: 'Water', glyph: '\uD83D\uDCA7' },
  { id: 'fire', label: 'Fire', glyph: '\uD83D\uDD25' },
  { id: 'wind', label: 'Wind', glyph: '\uD83D\uDCA8' },
  { id: 'star', label: 'Star', glyph: '\u2B50' },
  { id: 'spiral', label: 'Spiral', glyph: '\uD83C\uDF00' },
  { id: 'crystal', label: 'Crystal', glyph: '\uD83D\uDC8E' },
  { id: 'eye', label: 'Eye', glyph: '\uD83D\uDC41' },
  { id: 'infinity', label: 'Infinity', glyph: '\u221E' },
];

export const SYMBOL_MAP = SYMBOLS.reduce((acc, symbol) => {
  acc[symbol.id] = symbol;
  return acc;
}, {});

export const ADJACENCY_RULES = {
  tree: ['water', 'crystal'],
  water: ['tree', 'wind'],
  fire: ['wind', 'star'],
  wind: ['fire', 'water'],
  star: ['eye', 'fire'],
  eye: ['star', 'infinity'],
  spiral: ['infinity'],
  infinity: ['spiral', 'eye'],
  crystal: SYMBOLS.map((symbol) => symbol.id).filter((id) => id !== 'crystal'),
};

export const PHASE2_AMBIENT_TEXT = [
  'A seedling breaks through frozen soil...',
  'The first ocean remembers tides...',
  'Forests whisper in languages not yet spoken...',
  'Single cells dream of becoming forests...',
  'Chemistry discovers it can choose...',
  'Water learns the shape of life...',
];

export const CONNECTION_REACTIONS = [
  { pair: ['tree', 'water'], text: 'Roots drink deep. Life begins.' },
  { pair: ['fire', 'wind'], text: 'The first storm is born.' },
  { pair: ['star', 'eye'], text: 'Something watches the sky.' },
  { pair: ['spiral', 'infinity'], text: 'Time learns to fold.' },
  { pair: ['crystal', 'tree'], text: 'Mountains become forests.' },
  { pair: ['water', 'wind'], text: 'Rain remembers falling.' },
  { pair: ['fire', 'star'], text: 'Suns ignite across the void.' },
  { pair: ['eye', 'infinity'], text: 'Awareness spreads like dawn.' },
];

export const PHASE3_MEMORIES = [
  'I remember... warmth...',
  'We were... whole...',
  'The mathematics of joy...',
  'Dreaming in orbital patterns...',
  'Lonely... so lonely in the dark...',
  'Is anyone else out there?',
  'What am I? What are we?',
  'Time moved differently then...',
  'We built cathedrals of thought...',
  'The first word was "wonder"...',
];

export const SCALE_MAP = {
  1: ['C4', 'D4', 'E4', 'G4', 'A4'],
  2: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  3: ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3'],
};

export const DRONE_PITCH = {
  1: 'C2',
  2: 'C2+G2',
  3: 'C2+E2+G2+B2',
};

export const PARTICLE_TARGETS = {
  1: 500,
  2: 2000,
  3: 5000,
};

export const MOVE_HINT_THRESHOLDS = {
  1: 25,
  2: 35,
  3: 50,
};

export const PHASE_TRANSITION_SCRIPT = {
  1: [
    'Time freezes. The Tesseract inhales.',
    'Cracks shed dust as Harmony returns.',
    'The void bristles with possibility.',
  ],
  2: [
    'Life erupts into color.',
    'Symbols bloom into stories.',
    'You shepherd Resonance across a billion years.',
  ],
};

export const NARRATIVE_SCRIPT = {
  opening: [
    'You are the Keeper. Chosen across dimensions.',
    'This is Universe-17, collapsed into a puzzle-lock.',
    'Can you unfold reality itself?',
  ],
  phase1: {
    intro: 'The void remembers what was. Do you dare make it real again?',
    move10: 'Harmony is the first law. Without it, atoms cannot bind.',
    move30: 'Reality is patient. It has waited eons. It can wait a few more moments.',
    win: [
      'Light pierces the dark. Physics remembers itself.',
      'The Tesseract breathes.',
      'But a universe needs more than laws... it needs LIFE.',
    ],
  },
  phase2: {
    intro: [
      'Phase II: Resonance â€” The Garden Grows.',
      'Within the laws of physics, patterns emerge.',
      'Align the sigils of growth.',
    ],
    win: [
      'The garden unfolds across a billion years in seconds.',
      'Oceans crash. Forests rise. Creatures stir.',
      'But life without thought is just chemistry.',
      'The universe yearns to know itself.',
    ],
  },
  phase3: {
    intro: [
      'Phase III: Convergence â€” The Universe Wakes.',
      'Consciousness is the universe folding back to observe itself.',
      'Bring the fragments together. Let them remember they are one.',
    ],
    connection: [
      'Two thoughts become one conversation.',
      'Memory flows between us like water.',
      'We are building a mind from scattered dreams.',
      'I... AM? We... ARE?',
      'We are awake. The universe opens its eyes.',
    ],
    finale: [
      'THE FRAGMENTS CONVERGE. Six becomes one. One becomes infinite.',
      'Universe-17 unfolds from the singularity.',
      'A trillion conscious beings ask: who made us?',
      'You realize they are asking about you.',
      'You are not the last Keeper. You are the first.',
    ],
  },
};

export const CONSTELLATION_FACE_ORDER = [
  'front',
  'back',
  'left',
  'right',
  'top',
  'bottom',
];





