// ─── Font System: 100+ Google Fonts On-Demand Loader ────────────────

const LOADED_FONTS = new Set<string>();

export const FONT_CATEGORIES = {
  Sans: [
    "Inter", "Space Grotesk", "Archivo", "Outfit", "Plus Jakarta Sans",
    "DM Sans", "Work Sans", "Cabinet Grotesk", "Satoshi", "Montserrat",
    "Oswald", "Cabin", "Quicksand", "Nunito", "Kanit", "Rubik", "Arimo",
    "Albert Sans", "Golos Text", "Heebo", "Manrope", "IBM Plex Sans",
    "Urbanist", "Be Vietnam Pro", "Poppins", "Roboto", "Open Sans",
    "Lato", "Raleway", "Ubuntu"
  ],
  Serif: [
    "Playfair Display", "Lora", "Merriweather", "Cormorant Garamond", "Fraunces",
    "Cinzel", "PT Serif", "EB Garamond", "Noto Serif", "Libre Baskerville",
    "Arvo", "Cardo", "Domine", "Prata", "Crimson Text", "Sorts Mill Goudy"
  ],
  Display: [
    "Syne", "Clash Display", "Unbounded", "Righteous", "Calistoga",
    "Cabinet Grotesk", "Oswald", "Bebas Neue", "Cinzel Decorative",
    "Abril Fatface", "Alumni Sans", "Syncopate", "Bungee", "Titan One",
    "Secular One", "Passion One", "Platypi", "Stalinist One", "Chakra Petch"
  ],
  Handwriting: [
    "Caveat", "Pacifico", "Dancing Script", "Shadows Into Light", "Satisfy",
    "Sacramento", "Great Vibes", "Alex Brush", "Yellowtail", "Playball"
  ],
  Mono: [
    "Space Mono", "JetBrains Mono", "Fira Code", "Roboto Mono", "Courier Prime",
    "Inconsolata", "Source Code Pro", "Anonymous Pro", "IBM Plex Mono", "Share Tech Mono"
  ]
};

// Ensure a font family is loaded by appending a <link> element
export function loadFontFamily(family: string) {
  if (!family || LOADED_FONTS.has(family)) return;
  
  // Guard generic families
  const generics = ["sans-serif", "serif", "monospace", "cursive", "fantasy", "system-ui"];
  if (generics.includes(family.toLowerCase())) return;

  try {
    const formattedFamily = family.replace(/\s+/g, "+");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFamily}:wght@300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
    LOADED_FONTS.add(family);
  } catch (e) {
    console.error(`Failed to load font family: ${family}`, e);
  }
}

// Scans CSS string for font-family declarations and loads any referenced families
export function ensureFontsFromCss(css: string) {
  if (!css) return;
  const regex = /font-family:\s*['"]?([^'";,]+)['"]?/gi;
  let match;
  while ((match = regex.exec(css)) !== null) {
    const family = match[1].trim();
    loadFontFamily(family);
  }
}
