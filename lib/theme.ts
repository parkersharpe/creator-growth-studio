export const DARK = {
  bg: "#050507", bg2: "#0a0a0a", surface: "#0f0f11", surface2: "#141416", surface3: "#1a1a1e",
  border: "#1f1f22", border2: "#2a2a2e", text: "#ffffff", text2: "#888888",
  text3: "#444444", text4: "#2a2a2a", pill: "#141416", pillBrd: "#1f1f22",
  pillTxt: "#666666", pillActive: "#ffffff", pillActiveTxt: "#000000",
  btnBg: "#ffffff", btnTxt: "#000000", accent: "#ffffff",
  navBg: "rgba(5,5,7,0.92)", shadow: "0 2px 20px rgba(0,0,0,0.4)",
  shadowMd: "0 8px 40px rgba(0,0,0,0.7)",
};

export const LIGHT = {
  bg: "#ffffff", bg2: "#f7f7f8", surface: "#ffffff", surface2: "#f5f5f7", surface3: "#f0f0f2",
  border: "#efefef", border2: "#e5e5e5", text: "#0a0a0a", text2: "#6b6b6b",
  text3: "#b0b0b0", text4: "#d0d0d0", pill: "#f5f5f5", pillBrd: "#efefef",
  pillTxt: "#6b6b6b", pillActive: "#0a0a0a", pillActiveTxt: "#ffffff",
  btnBg: "#0a0a0a", btnTxt: "#ffffff", accent: "#0a0a0a",
  navBg: "rgba(255,255,255,0.92)", shadow: "0 2px 20px rgba(0,0,0,0.06)",
  shadowMd: "0 8px 40px rgba(0,0,0,0.10)",
};

export const VOICES = [
  { id: "parker", label: "Parker Sharpe", desc: "Raw · Street-smart · Entrepreneurial" },
  { id: "hormozi", label: "Hormozi", desc: "Short · Direct · Brutal" },
  { id: "naval", label: "Naval", desc: "Philosophical · Aphoristic" },
  { id: "contrarian", label: "Contrarian", desc: "Challenges assumptions" },
  { id: "story", label: "Story", desc: "Narrative · Emotional" },
  { id: "faith", label: "Faith", desc: "Spiritual · Purpose-driven" },
  { id: "garyvee", label: "Gary Vee", desc: "Loud · Hustle · Grateful" },
  { id: "stoic", label: "Stoic", desc: "Marcus Aurelius · Ancient wisdom" },
  { id: "feminine", label: "Feminine Power", desc: "Bold · Soft · Unapologetic" },
  { id: "coach", label: "The Coach", desc: "Mentor energy · Push harder" },
  { id: "poet", label: "Poetic", desc: "Lyrical · Metaphorical · Deep" },
  { id: "millionaire", label: "Millionaire Mindset", desc: "Wealth · Abundance · Think bigger" },
  { id: "vulnerable", label: "Vulnerable", desc: "Raw honesty · Healing · Growth" },
  { id: "custom", label: "Custom Voice", desc: "Define your own style" },
];

export const NICHES = [
  // Business & Money
  "Entrepreneurship", "Business", "Startups", "Real Estate", "Investing",
  "Finance", "Crypto & Web3", "E-Commerce", "Side Hustles", "Passive Income",
  // Health & Body
  "Fitness", "Health & Wellness", "Nutrition", "Mental Health", "Mindset",
  "Yoga & Meditation", "Weight Loss", "Bodybuilding",
  // Lifestyle
  "Travel", "Food & Lifestyle", "Parenting", "Relationships", "Dating & Attraction",
  "Spirituality", "Faith", "Minimalism", "Self-Help",
  // Creator
  "Marketing", "Sales", "Personal Development", "Leadership", "Coaching",
  "Photography", "Art & Design", "Music", "Comedy", "Gaming", "Technology",
  // Women
  "Women in Business", "Beauty & Fashion", "Female Empowerment", "Motherhood",
  // Sports
  "Sports", "Basketball", "Football", "MMA & Combat Sports",
];

export const FONTS: Record<string, { label: string; google: string }> = {
  "Playfair Display": { label: "Classic", google: "Playfair+Display:ital,wght@0,400;0,700;1,400" },
  "Cormorant Garamond": { label: "Luxury", google: "Cormorant+Garamond:ital,wght@0,400;0,600;1,400" },
  "DM Serif Display": { label: "Editorial", google: "DM+Serif+Display:ital@0;1" },
  "Syne": { label: "Modern", google: "Syne:wght@400;700;800" },
  "Inter": { label: "Clean", google: "Inter:wght@400;600;700" },
};

export const BG_PRESETS = [
  // Dark/Neutral
  { label: "Black", value: "#000000", text: "#FFFFFF" },
  { label: "Charcoal", value: "#111111", text: "#FFFFFF" },
  { label: "White", value: "#FFFFFF", text: "#000000" },
  { label: "Cream", value: "#F8F5EE", text: "#1A1A1A" },
  { label: "Navy", value: "#0C1220", text: "#FFFFFF" },
  { label: "Forest", value: "#0F2318", text: "#FFFFFF" },
  { label: "Slate", value: "#1E293B", text: "#FFFFFF" },
  { label: "Gold Dark", value: "#1A1408", text: "#C9A84C" },
  // Feminine / Warm
  { label: "Hot Pink", value: "#FF0070", text: "#FFFFFF" },
  { label: "Blush", value: "#F9D5E5", text: "#3D1A26" },
  { label: "Rose", value: "#C4818A", text: "#FFFFFF" },
  { label: "Dusty Rose", value: "#B5737D", text: "#FFFFFF" },
  { label: "Mauve", value: "#C4956A", text: "#FFFFFF" },
  { label: "Lavender", value: "#9B8EC4", text: "#FFFFFF" },
  { label: "Lilac", value: "#E8D5FF", text: "#3D1A5A" },
  { label: "Berry", value: "#6B2D5E", text: "#FFFFFF" },
  // Bold
  { label: "Rust", value: "#B44C2A", text: "#FFFFFF" },
  { label: "Olive", value: "#4A5240", text: "#FFFFFF" },
  { label: "Teal", value: "#0D5C63", text: "#FFFFFF" },
  { label: "Cobalt", value: "#1B3A8C", text: "#FFFFFF" },
];

export const GRADIENTS = [
  { label: "Black to Charcoal", value: "linear-gradient(160deg,#000 0%,#1A1A1A 100%)", text: "#FFFFFF" },
  { label: "Navy to Black", value: "linear-gradient(160deg,#0C1220 0%,#000 100%)", text: "#FFFFFF" },
  { label: "Forest to Black", value: "linear-gradient(160deg,#0F2318 0%,#000 100%)", text: "#FFFFFF" },
  { label: "Slate to Dark", value: "linear-gradient(160deg,#1E293B 0%,#0a0a0a 100%)", text: "#FFFFFF" },
  { label: "Cream to Beige", value: "linear-gradient(160deg,#FAFAF7 0%,#F0EAD6 100%)", text: "#1A1A1A" },
  { label: "Pink Sunset", value: "linear-gradient(160deg,#FF0070 0%,#FF6B6B 100%)", text: "#FFFFFF" },
  { label: "Rose Gold", value: "linear-gradient(160deg,#B44C7A 0%,#C4956A 100%)", text: "#FFFFFF" },
  { label: "Berry Bliss", value: "linear-gradient(160deg,#6B2D5E 0%,#9B8EC4 100%)", text: "#FFFFFF" },
  { label: "Lavender Dream", value: "linear-gradient(160deg,#9B8EC4 0%,#E8D5FF 100%)", text: "#3D1A5A" },
  { label: "Midnight Blue", value: "linear-gradient(160deg,#0C1220 0%,#1B3A8C 100%)", text: "#FFFFFF" },
  { label: "Teal Ocean", value: "linear-gradient(160deg,#0D5C63 0%,#0a0a0a 100%)", text: "#FFFFFF" },
  { label: "Warm Rust", value: "linear-gradient(160deg,#B44C2A 0%,#1A0A00 100%)", text: "#FFFFFF" },
];

export const SEED_QUOTES = [
  { text: "Nobody talks about how lonely it gets when you stop making excuses and start winning.", virality: 94, share: "Very High" as const, save: "Very High" as const, category: "Entrepreneurship" },
  { text: "Most people don't have a money problem. They have a discipline problem.", virality: 91, share: "Very High" as const, save: "High" as const, category: "Discipline" },
  { text: "Success costs people. Sometimes the people it costs are the ones you never expected to lose.", virality: 88, share: "High" as const, save: "Very High" as const, category: "Personal Growth" },
  { text: "The market doesn't care about your feelings. Build anyway.", virality: 85, share: "High" as const, save: "High" as const, category: "Business" },
  { text: "Stop waiting to feel ready. Ready is a myth they sell to people afraid to start.", virality: 87, share: "Very High" as const, save: "High" as const, category: "Entrepreneurship" },
  { text: "Build something real or sit down. No in-between.", virality: 79, share: "High" as const, save: "High" as const, category: "Business" },
  { text: "Most people quit right before the profit. Don't be most people.", virality: 90, share: "Very High" as const, save: "Very High" as const, category: "Wealth" },
  { text: "You're not tired. You're just not hungry enough yet.", virality: 83, share: "High" as const, save: "High" as const, category: "Discipline" },
  { text: "Every business I built started from zero. That's not a story — it's a system.", virality: 86, share: "High" as const, save: "Very High" as const, category: "Entrepreneurship" },
  { text: "Freedom isn't free. But the invoice is worth every dollar.", virality: 80, share: "High" as const, save: "Medium" as const, category: "Personal Growth" },
];
