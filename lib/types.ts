export interface Quote {
  text: string;
  virality: number;
  share: "Low" | "Medium" | "High" | "Very High";
  save: "Low" | "Medium" | "High" | "Very High";
  category: string;
}

export interface BrandProfile {
  name: string;
  handle: string;
  niche: string;
  niches?: string[]; // up to 3 — niche stays the primary for back-compat
  website: string;
  avatar: string;
  verified: boolean;
}

// Niches for AI prompts: joined list when multiple are set
export function nicheLabel(p: BrandProfile): string {
  return p.niches && p.niches.length > 0 ? p.niches.join(', ') : p.niche;
}

export interface DesignSettings {
  bgType: "solid" | "gradient";
  bgValue: string;
  textColor: string;
  handleColor: string;
  font: FontKey;
  borderRadius: number;
  shadow: boolean;
  padding: number;
  photoShape: "circle" | "rounded" | "square";
  photoSize: number;
  verified: boolean;
  fontSize: number;
  bgMedia?: { type: 'image' | 'video'; url: string } | null;
  // Top-left of the attribution block as a fraction (0..1) of the card.
  // null/undefined = default bottom-left layout.
  profilePos?: { x: number; y: number } | null;
}

export type FontKey = "Playfair Display" | "Cormorant Garamond" | "DM Serif Display" | "Syne" | "Inter";
export type VoiceKey = "parker" | "hormozi" | "naval" | "contrarian" | "story" | "faith" | "garyvee" | "stoic" | "feminine" | "coach" | "poet" | "millionaire" | "vulnerable" | "custom";
export type MachineType = "tweets" | "hooks" | "captions" | "threads" | "questions";
