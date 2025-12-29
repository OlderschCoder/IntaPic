export interface Background {
  id: string;
  name: string;
  gradient: string;
  overlay?: string;
}

export const romanticBackgrounds: Background[] = [
  {
    id: "none",
    name: "No Background",
    gradient: "transparent",
  },
  {
    id: "sunset-blush",
    name: "Sunset Blush",
    gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 50%, #f093fb 100%)",
  },
  {
    id: "rose-petals",
    name: "Rose Petals",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ee9ca7 100%)",
  },
  {
    id: "twilight-love",
    name: "Twilight Love",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
  },
  {
    id: "champagne-dreams",
    name: "Champagne Dreams",
    gradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 30%, #d4af37 100%)",
  },
  {
    id: "midnight-romance",
    name: "Midnight Romance",
    gradient: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #4a1942 100%)",
  },
  {
    id: "hearts-afire",
    name: "Hearts Afire",
    gradient: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 50%, #f7797d 100%)",
  },
  {
    id: "enchanted-garden",
    name: "Enchanted Garden",
    gradient: "linear-gradient(135deg, #134e5e 0%, #71b280 50%, #a8e063 100%)",
  },
  {
    id: "cotton-candy",
    name: "Cotton Candy",
    gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 50%, #c2e9fb 100%)",
  },
  {
    id: "vintage-love",
    name: "Vintage Love",
    gradient: "linear-gradient(135deg, #f5f5dc 0%, #d4a574 50%, #8b4513 100%)",
  },
  {
    id: "starry-night",
    name: "Starry Night",
    gradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    overlay: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 1px, transparent 1px), radial-gradient(circle at 50% 70%, rgba(255,255,255,0.25) 1px, transparent 1px)",
  },
];

export function getBackgroundById(id: string): Background {
  return romanticBackgrounds.find(bg => bg.id === id) || romanticBackgrounds[0];
}
