# Netlify Functions

## Setup

### Environment Variables

Add the following environment variable to your Netlify site:

1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key from https://platform.openai.com/api-keys

### Local Development

For local testing with Netlify CLI:

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Create a `.env` file in the project root (copy from `.env.example`)
3. Add your OpenAI API key to the `.env` file
4. Run: `netlify dev`

## Functions

### generate-riddle

Generates dynamic, themed riddles using OpenAI's GPT-4 API.

**Endpoint:** `/.netlify/functions/generate-riddle`

**Method:** POST

**Request Body:**
```json
{
  "phase": 1,
  "previousRiddles": ["riddle 1", "riddle 2"]
}
```

**Response:**
```json
{
  "riddle": "The riddle text",
  "answer": "single word answer",
  "hint": "optional hint"
}
```

**Features:**
- Themed riddles based on game phase
- Avoids repeating recent riddles
- Fallback riddles if API fails
- Mystical/cosmic tone matching game aesthetic
