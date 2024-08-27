
type Icon = '🔴' | '🟢' | '🔵' | '⚪' | '🚦' | '💡';

export const CODEBOOK: { [p: string]: Icon | `${Icon}${Icon}` } = {
  "0": "🔴",
  "1": "🟢",
  "2": "🔴🟢",
  "3": "🔴🔵",
  "4": "🔴⚪",
  "5": "🟢🔵",
  "6": "🟢⚪",
  "7": "🔵⚪",
  "8": "⚪⚪",
  "9": "🔵",
  "A": "🔵🔴",
  "B": "🟢🔴",
  "C": "⚪🔴",
  "D": "🔵🟢",
  "E": "⚪🔵",
  "F": "⚪",
  "\n": "🚦",       // 1 símbolo (indicador de nueva línea)
  "|": "💡"        // 1 símbolo (indicador de separación)
};

export const REVERSE_CODEBOOK = Object.fromEntries(
  Object.entries(CODEBOOK).map(([key, value]) => [value, key])
);

// Función para extraer íconos únicos del CODEBOOK
function getUniqueIcons(codebook: { [key: string]: string }): string[] {
  const uniqueIcons = new Set<string>();
  for (const symbol of Object.values(codebook)) {
    for (const char of symbol) {
      uniqueIcons.add(char);
    }
  }
  return Array.from(uniqueIcons);
}

// Función para construir el regex de iconos permitidos
function buildAllowedIconsRegex(codebook: { [key: string]: string }): RegExp {
  const uniqueIcons = getUniqueIcons(codebook);
  const allowedIcons = uniqueIcons.join('');
  return new RegExp(`^[${allowedIcons}]+$`);
}

// Construir el regex de los valores permitidos
export const ALLOWED_ICONS_REGEX = buildAllowedIconsRegex(CODEBOOK);

// Función para construir el regex de caracteres no permitidos
function buildCleanedIconsRegex(codebook: { [key: string]: string }): RegExp {
  const uniqueIcons = getUniqueIcons(codebook);
  const allowedIcons = uniqueIcons.join('');
  return new RegExp(`[^${allowedIcons}]`, 'g');
}

// Construir el regex para eliminar caracteres no permitidos
export const CLEANED_ICONS_REGEX = buildCleanedIconsRegex(CODEBOOK);

// Mapeo de teclas a íconos
// Definición de tipo para las teclas
export type IconsKeys = 'a' | 'w' | 'd' | 's' | 'j' | 'i' | 'l' | 'k' | 'e' | 'p' | 'q' | 'r';

// Mapeo simbólico de teclas a íconos
const KEY_GROUPS: Record<Icon, IconsKeys[]> = {
  '🔴': ['a', 'j'],
  '🟢': ['w', 'i'],
  '🔵': ['d', 'l'],
  '⚪': ['s', 'k'],
  '💡': ['q', 'i'],
  '🚦': ['e', 'p']
};

// Inicializar el mapeo de teclas a íconos con Partial para evitar el error inicial
const keyToIconMap: Partial<Record<IconsKeys, Icon>> = {};

// Llenar el objeto keyToIconMap usando el objeto de grupos de teclas
for (const [icon, keys] of Object.entries(KEY_GROUPS) as [Icon, IconsKeys[]][]) {
  for (const key of keys) {
    keyToIconMap[key] = icon;
  }
}

// Asegurar a TypeScript que keyToIconMap ahora cumple con Record<Key, Icon>
export const KEY_TO_ICON = keyToIconMap as Record<IconsKeys, Icon>;