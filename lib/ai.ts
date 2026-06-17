import Anthropic from '@anthropic-ai/sdk';
import { MODEL } from './prompts';

const client = new Anthropic();

// If the preferred (latest) model isn't available on this account, fall back to a
// known-good one so generation never hard-fails for users.
const FALLBACK_MODEL = 'claude-opus-4-5';

export async function generateText(prompt: string, maxTokens: number, temperature = 1): Promise<string> {
  const base = {
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'user' as const, content: prompt }],
  };
  try {
    const msg = await client.messages.create({ model: MODEL, ...base });
    return (msg.content[0] as { type: string; text: string }).text;
  } catch (e) {
    console.error('primary model failed, falling back', e);
    const msg = await client.messages.create({ model: FALLBACK_MODEL, ...base });
    return (msg.content[0] as { type: string; text: string }).text;
  }
}
