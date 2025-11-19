export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { phase, previousRiddles = [] } = JSON.parse(event.body);

    const phaseThemes = {
      1: 'colors, unity, and awakening consciousness',
      2: 'symbols, connections, and resonating patterns',
      3: 'fragments, alignment, and cosmic convergence',
    };

    const theme = phaseThemes[phase] || 'cosmic mysteries';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a mystical oracle creating riddles for The Tesseract game. Create riddles themed around ${theme}. Each riddle should be:
- Short (2-3 lines max)
- Mystical and cosmic in tone
- Have a single-word answer
- Be solvable with thought
- Different from previous riddles: ${previousRiddles.join(', ') || 'none yet'}

Return ONLY a JSON object with this format:
{
  "riddle": "the riddle text",
  "answer": "single word answer",
  "hint": "optional hint if stuck"
}`,
          },
          {
            role: 'user',
            content: `Generate a riddle for Phase ${phase} about ${theme}.`,
          },
        ],
        temperature: 0.9,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const riddleData = JSON.parse(data.choices[0].message.content);

    return {
      statusCode: 200,
      body: JSON.stringify(riddleData),
    };
  } catch (error) {
    console.error('Error generating riddle:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate riddle' }),
    };
  }
};
