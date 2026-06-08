import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { buildGeneratePrompt } from '@/lib/prompts';

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { count, voice, niche, name, handle, customVoiceDesc } = await req.json();
    const prompt = buildGeneratePrompt(count, voice, niche, name, handle, customVoiceDesc);
    const msg = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = (msg.content[0] as { type: string; text: string }).text.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(raw));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
