const riddleCache = new Map();
const previousRiddles = [];

export const generateRiddle = async (phase) => {
  try {
    const response = await fetch('/.netlify/functions/generate-riddle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phase,
        previousRiddles: previousRiddles.slice(-5), // Last 5 riddles to avoid repetition
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch riddle');
    }

    const riddleData = await response.json();
    previousRiddles.push(riddleData.riddle);
    riddleCache.set(phase, riddleData);

    return riddleData;
  } catch (error) {
    console.error('Error generating riddle:', error);
    // Fallback riddles if API fails
    return getFallbackRiddle(phase);
  }
};

export const validateAnswer = (userAnswer, correctAnswer) => {
  const normalized = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  return normalized(userAnswer) === normalized(correctAnswer);
};

const getFallbackRiddle = (phase) => {
  const fallbacks = {
    1: {
      riddle: 'I am the beginning and the end, the first and the last. In unity, all shades of me become one. What am I?',
      answer: 'light',
      hint: 'Without me, color cannot exist',
    },
    2: {
      riddle: 'We are two, yet one. Opposite in nature, complementary in spirit. When we meet, harmony blooms. What are we?',
      answer: 'pair',
      hint: 'Think of the matching symbols',
    },
    3: {
      riddle: 'Scattered across the void, I once told stories. Bring me together, and I shall shine again. What am I?',
      answer: 'constellation',
      hint: 'Look to the stars',
    },
  };
  return fallbacks[phase] || fallbacks[1];
};
