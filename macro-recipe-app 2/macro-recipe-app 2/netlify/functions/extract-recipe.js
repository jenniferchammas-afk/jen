// netlify/functions/extract-recipe.js
//
// Takes a recipe URL, fetches the page server-side (avoids the browser CORS
// wall you'd hit calling this from the frontend directly), strips it down
// to readable text, and asks Claude to pull out a clean structured recipe:
// title, ingredients with quantities, and estimated macros.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
// Check https://docs.claude.com/en/docs/about-claude/models for the current
// model ID if this one has been retired by the time you deploy.
const MODEL = 'claude-sonnet-4-5-20250929'

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractJson(text) {
  // Claude may wrap JSON in a markdown fence despite instructions; strip it.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = fenced ? fenced[1] : text
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in model response')
  return JSON.parse(raw.slice(start, end + 1))
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  let url
  try {
    ;({ url } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  if (!url || !/^https?:\/\//i.test(url)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Provide a valid recipe URL' }) }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set on the server' }) }
  }

  // 1. Fetch the page server-side.
  let pageText
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const pageRes = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
    })
    clearTimeout(timeout)
    if (!pageRes.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: `Could not fetch that page (HTTP ${pageRes.status})` }) }
    }
    const html = await pageRes.text()
    pageText = htmlToText(html).slice(0, 20000) // keep prompt size sane
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: `Failed to fetch the URL: ${err.message}` }) }
  }

  // 2. Ask Claude to extract structured recipe data.
  const prompt = `Here is the visible text scraped from a recipe webpage (HTML tags stripped). Extract the recipe and respond with ONLY a JSON object, no prose, no markdown fence, matching exactly this shape:

{
  "title": string,
  "servings": number | null,
  "ingredients": [ { "name": string, "quantity": number | null, "unit": string | null } ],
  "macros_per_serving": { "calories": number | null, "protein_g": number | null, "carbs_g": number | null, "fat_g": number | null, "estimated": boolean },
  "instructions_summary": string
}

Rules:
- "ingredients" should be the ingredient list as written, with quantity/unit split out where possible (e.g. "2 cups spinach" -> name: "spinach", quantity: 2, unit: "cups"). If a quantity can't be parsed, use null for quantity/unit but keep the name.
- If the page states nutrition facts, use them and set "estimated": false. If it doesn't, estimate the macros yourself from the ingredients and set "estimated": true.
- If this page is not actually a recipe, return {"error": "not_a_recipe"} instead.
- "instructions_summary" is 1-2 sentences, not the full method.

Page text:
"""
${pageText}
"""`

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
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      return { statusCode: 502, body: JSON.stringify({ error: `Claude API error: ${errText}` }) }
    }

    const aiJson = await aiRes.json()
    const text = aiJson.content?.[0]?.text || ''
    const parsed = extractJson(text)

    if (parsed.error === 'not_a_recipe') {
      return { statusCode: 422, body: JSON.stringify({ error: "That page doesn't look like a recipe." }) }
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...parsed, source_url: url }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: `Failed to parse recipe: ${err.message}` }) }
  }
}
