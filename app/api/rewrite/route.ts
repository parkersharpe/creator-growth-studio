import { NextResponse } from 'next/server';
import { buildRewritePrompt } from '@/lib/prompts';
import { generateText } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { quote, voice, niche, name, customVoiceDesc, brand } = await req.json();
    const prompt = buildRewritePrompt(quote, voice, niche, name, customVoiceDesc, brand);
    const text = await generateText(prompt, 400);
    const raw = text.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(raw));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Rewrite failed' }, { status: 500 });
  }
}
