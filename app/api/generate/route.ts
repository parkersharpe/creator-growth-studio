import { NextResponse } from 'next/server';
import { buildGeneratePrompt } from '@/lib/prompts';
import { generateText } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { count, voice, niche, name, handle, customVoiceDesc, brand } = await req.json();
    const prompt = buildGeneratePrompt(count, voice, niche, name, handle, customVoiceDesc, brand);
    const text = await generateText(prompt, 4000);
    const raw = text.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(raw));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
