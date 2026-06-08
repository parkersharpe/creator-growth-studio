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

export const buildGeneratePrompt = (count: number, voice: string, niche: string, name: string, handle: string, customVoiceDesc?: string) => `
Generate exactly ${count} viral quotes for ${name} (@${handle}) in the ${niche} niche.

Voice: ${customVoiceDesc || VOICE_MAP[voice] || VOICE_MAP.parker}

Rules:
- 6-18 words per quote
- No hashtags, no emojis, no clichés like "hustle" or "grind"
- Each must feel like something people screenshot and save
- Vary categories: Business, Wealth, Discipline, Personal Growth, Relationships, Leadership

Return ONLY a JSON array. Each item:
{"text":"...","virality":85,"share":"Very High","save":"High","category":"Discipline"}
No markdown. No explanation. Only the JSON array.`;

export const buildRewritePrompt = (quote: string, voice: string, niche: string, name: string, customVoiceDesc?: string) => `
Rewrite this quote to be more viral. Creator: ${name}. Niche: ${niche}. Voice: ${customVoiceDesc || VOICE_MAP[voice] || VOICE_MAP.parker}.

Original: "${quote}"

Make it hit harder. Add contrast, specificity, or a pattern interrupt.
Keep it under 20 words. No emojis. No hashtags.

Return ONLY: {"text":"rewritten quote","virality":96,"share":"Very High","save":"Very High","category":"Discipline"}`;

export const buildMachinePrompt = (type: string, voice: string, niche: string, name: string, handle: string, customVoiceDesc?: string) => {
  const specs: Record<string, string> = {
    tweets: "30 punchy tweets under 220 characters each. No hashtags. Native to Twitter/X.",
    hooks: "30 reel video hooks. First 3 seconds of speech. Start with a statement, not a question.",
    captions: "20 Instagram captions. 2-4 sentences. End with a soft CTA.",
    threads: "15 thread starters. Opening line + 2-sentence preview. Irresistible hook.",
    questions: `25 engagement questions that trigger real replies. Specific to ${niche}.`,
  };
  return `Generate for ${name} (@${handle}) — ${niche} niche.
Voice: ${customVoiceDesc || VOICE_MAP[voice] || VOICE_MAP.parker}
Content: ${specs[type] || specs.tweets}
Return ONLY a JSON array of strings. No markdown.`;
};
