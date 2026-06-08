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
  website: string;
  avatar: string;
  verified: boolean;
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
}

export type FontKey = "Playfair Display" | "Cormorant Garamond" | "DM Serif Display" | "Syne" | "Inter";
export type VoiceKey = "parker" | "hormozi" | "naval" | "contrarian" | "story" | "faith" | "garyvee" | "stoic" | "feminine" | "coach" | "poet" | "millionaire" | "vulnerable" | "custom";
export type MachineType = "tweets" | "hooks" | "captions" | "threads" | "questions";
