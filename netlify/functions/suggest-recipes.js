// netlify/functions/suggest-recipes.js
//
// Takes target macros and returns Claude-generated recipe suggestions that
// fit them, in the same shape extract-recipe.js returns, so the frontend
// can treat "browsed" and "linked" recipes identically.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-5-20250929'

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = fenced ? fenced[1] : text
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('No JSON array found in model response')
  return JSON.parse(raw.slice(start, end + 1))
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { calories, protein_g, carbs_g, fat_g, mealType, count, notes } = body
  if (!calories && !protein_g) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Provide at least a calorie or protein target' }) }
  }
  const howMany = Math.min(Math.max(Number(count) || 6, 1), 12)

  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set on the server' }) }
  }

  const targetLines = [
    calories ? `~${calories} kcal` : null,
    protein_g ? `~${protein_g}g protein` : null,
    carbs_g ? `~${carbs_g}g carbs` : null,
    fat_g ? `~${fat_g}g fat` : null,
  ]
    .filter(Boolean)
    .join(', ')

  const prompt = `Suggest ${howMany} distinct, realistic, healthy recipes${mealType ? ` suitable for ${mealType}` : ''} that each land close to these per-serving macro targets: ${targetLines}.
${notes ? `Additional preferences to respect: ${notes}` : ''}

Favor whole-food, straightforward home cooking (no exotic ingredients that would be hard to buy at a UK-style supermarket like Waitrose). Vary the recipes from each other.

Respond with ONLY a JSON array, no prose, no markdown fence, where each item matches exactly this shape:

{
  "title": string,
  "servings": number,
  "ingredients": [ { "name": string, "quantity": number | null, "unit": string | null } ],
  "macros_per_serving": { "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "estimated": true },
  "instructions_summary": string
}`

  try {
    const aiRes = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      return { statusCode: 502, body: JSON.stringify({ error: `Claude API error: ${errText}` }) }
    }

    const aiJson = await aiRes.json()
    const text = aiJson.content?.[0]?.text || ''
    const recipes = extractJson(text)

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recipes }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: `Failed to generate recipes: ${err.message}` }) }
  }
}
