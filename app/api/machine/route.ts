import { NextResponse } from 'next/server';
import { buildMachinePrompt } from '@/lib/prompts';
import { generateText } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { type, voice, niche, name, handle, customVoiceDesc, brand } = await req.json();
    const prompt = buildMachinePrompt(type, voice, niche, name, handle, customVoiceDesc, brand);
    const text = await generateText(prompt, 6000);
    const raw = text.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(raw));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Machine failed' }, { status: 500 });
  }
}
