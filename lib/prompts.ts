import { BrandContext } from './types';

// Centralized model id — bump in one place. Use the most capable model for the most
// creative, least generic output.
export const MODEL = 'claude-opus-4-8';

export const VOICE_MAP: Record<string, string> = {
  parker: "Raw, gritty entrepreneurial energy. Street-smart big-brother tone. Reference loneliness of winning, building from zero, discipline, financial freedom. Sounds like a 27-year-old self-made builder.",
  hormozi: "Short. Direct. Brutal. Maximum signal, zero fluff. 1-2 lines max. Results-focused. No inspiration — just reality.",
  naval: "Philosophical, aphoristic. About wealth, freedom, leverage, clear thinking. Reads like a tweet that changes how you see the world.",
  contrarian: "Flip the conventional wisdom. Challenge what most people believe. Provocative but true.",
  story: "Narrative, emotional, confessional. Reads like a hard lesson learned. First-person perspective.",
  faith: "Spiritual conviction. God, purpose, resilience, faith over fear. Raw belief, not Sunday school.",
  garyvee: "High energy, grateful, loud about the grind. Mix of motivational screaming and genuine love for people. Self-aware hustle culture. References documenting, doing the work, and gratitude.",
  stoic: "Ancient wisdom meets modern life. Short, timeless. Sounds like Marcus Aurelius rewritten for today. About control, virtue, discipline, and accepting what you cannot change.",
  feminine: "Bold and soft at the same time. Empowering without being aggressive. Written for women who build empires and raise families. Graceful, confident, unapologetic.",
  coach: "Direct mentor energy. Pushes you harder. Like a great coach at halftime. Specific, actionable, no excuses. Makes you want to get up and move.",
  poet: "Lyrical and metaphorical. Uses imagery and rhythm. Reads like a short poem that hits you in the chest. Unexpected word choices.",
  millionaire: "Abundance mindset. Thinks in decades. References compounding, leverage, buying back time, and thinking bigger than most people allow themselves.",
  vulnerable: "Raw honesty about struggle, healing, and growth. First person. Reads like a journal entry that accidentally went viral. No toxic positivity — just real.",
  custom: "Use the custom voice description provided by the creator exactly as written.",
};

const voiceOf = (voice: string, custom?: string) => custom || VOICE_MAP[voice] || VOICE_MAP.parker;

// A rotating palette of creative angles. We inject a random subset on every call so the
// SAME inputs don't keep producing the same lines — the #1 cause of "it all feels generic."
const ANGLES = [
  "a counterintuitive truth most people get wrong",
  "a vivid one-line micro-story or scene",
  "a sharp observation about everyday life",
  "a bold, almost-too-confident claim",
  "a myth you bust in one swing",
  "a before-and-after transformation",
  "a concrete number, time, or detail that makes it real",
  "a confession or admission",
  "a question that reframes how they see the problem",
  "a line with the rhythm of a song lyric",
  "an unexpected metaphor from an unrelated world",
  "a callout of a specific bad habit or excuse",
  "a future-pacing line that paints what's possible",
  "a 'if you only remember one thing' line",
  "dry humor or a wink",
  "a contrarian hot take that starts an argument in the comments",
];

function pickAngles(n: number): string[] {
  const a = [...ANGLES];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

// Shared creative guardrails. The goal is range and surprise, not safe filler.
function creativeDirection(): string {
  return `CREATIVE DIRECTION — this matters more than anything else:
- Surprise me. Nothing generic, no fortune-cookie platitudes, no LinkedIn-speak.
- Ban these overused formulas: "X isn't Y, it's Z", "Stop X. Start Y.", "Your X is your Y",
  "Normalize ___", "Dear ___,", anything starting with "In a world where".
- Every item must use a DIFFERENT angle, structure, and rhythm than the others. Mix short
  jabs, fragments, and longer turns. If two lines could be swapped between any two creators,
  they're too generic — rewrite them.
- Favor concrete, specific, sensory detail over abstraction. Real nouns beat vague ones.
- It's better to be polarizing and memorable than safe and forgettable.`;
}

function angleBlock(): string {
  return `Lean on a spread of these angles (use several, don't force all): ${pickAngles(8).join("; ")}.`;
}

// Brand framing. Businesses get marketing/local-relevance framing; people get personal-brand framing.
function brandBlock(brand?: BrandContext): string {
  if (brand?.accountType === "business") {
    const biz = brand.businessName || "the business";
    const where = brand.location ? ` in ${brand.location}` : "";
    const does = brand.services ? ` They do: ${brand.services}.` : "";
    const goal = brand.goal ? ` Primary goal of the content: ${brand.goal}.` : "";
    const city = brand.location ? brand.location.split(",")[0] : "the city";
    return `AUDIENCE & PURPOSE — this is content for a LOCAL BUSINESS, not a personal brand.
Business: ${biz}${where}.${does}${goal}
Write content that makes locals trust, remember, and CHOOSE this business:
- Weave in the location and the actual service naturally so it doubles as local marketing
  (e.g. authority lines like "${city}'s most-booked ${brand.services || "team"}", before/after wins, seasonal hooks).
- Rotate marketing angles: authority & social proof, a common customer pain solved, a quick
  expert tip that shows competence, a myth customers believe, a tasteful offer/CTA, behind-the-
  scenes pride, a reason to call TODAY.
- Sound like a confident, well-known local brand — specific and human, never like a national ad.`;
  }
  const goal = brand?.goal ? ` Their goal with this content: ${brand.goal}.` : "";
  return `AUDIENCE & PURPOSE — this is content for a personal brand / creator.${goal}
Make it feel like a real person with a point of view, not a motivational poster.`;
}

export const buildGeneratePrompt = (
  count: number, voice: string, niche: string, name: string, handle: string,
  customVoiceDesc?: string, brand?: BrandContext,
) => `
Generate exactly ${count} scroll-stopping, screenshot-worthy quotes for ${name} (@${handle}) in the ${niche} space.

Voice: ${voiceOf(voice, customVoiceDesc)}

${brandBlock(brand)}

${creativeDirection()}
${angleBlock()}

Format rules:
- 5-20 words each. No hashtags, no emojis.
- Punchy and human. Each should feel like a different writer wrote it.

Return ONLY a JSON array. Each item:
{"text":"...","virality":85,"share":"Very High","save":"High","category":"Discipline"}
No markdown. No explanation. Only the JSON array.`;

export const buildRewritePrompt = (
  quote: string, voice: string, niche: string, name: string,
  customVoiceDesc?: string, brand?: BrandContext,
) => `
Rewrite this line to be more viral and far less generic. Creator: ${name}. Niche: ${niche}.
Voice: ${voiceOf(voice, customVoiceDesc)}

${brandBlock(brand)}

Original: "${quote}"

Make it hit harder with a fresh angle — contrast, specificity, a pattern interrupt, or an
unexpected image. Avoid the banned formulas. Keep it under 20 words. No emojis, no hashtags.

Return ONLY: {"text":"rewritten quote","virality":96,"share":"Very High","save":"Very High","category":"Discipline"}`;

export const buildMachinePrompt = (
  type: string, voice: string, niche: string, name: string, handle: string,
  customVoiceDesc?: string, brand?: BrandContext,
) => {
  const specs: Record<string, string> = {
    tweets: "30 punchy tweets under 220 characters each. No hashtags. Native to Twitter/X.",
    hooks: "30 short-form video hooks — the spoken first 3 seconds. Start with a statement or a stat, not 'Have you ever'.",
    captions: "20 Instagram captions. 2-4 sentences. End with a soft, specific CTA.",
    threads: "15 thread starters. Opening line + a 2-sentence preview that's impossible not to keep reading.",
    questions: `25 engagement questions that trigger real replies. Specific to ${niche}.`,
  };
  return `Generate for ${name} (@${handle}) — ${niche} space.
Voice: ${voiceOf(voice, customVoiceDesc)}

${brandBlock(brand)}

${creativeDirection()}
${angleBlock()}

Content to produce: ${specs[type] || specs.tweets}

Return ONLY a JSON array of strings. No markdown.`;
};
