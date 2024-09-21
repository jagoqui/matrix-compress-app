export type Icon = '🔴' | '🟢' | '🔵' | '⚪' | '🌿' | '🚨' | '❌';
export const HEX_SEPARATOR = '|';
export const BREAK_LINE = '\n';
export const SPACE = ' ';

export const CODEBOOK: { [p: string]: Icon | `${Icon}${Icon}` } = {
  '0': '🔴',
  '1': '🟢',
  '2': '🔴🟢',
  '3': '🔴🔵',
  '4': '🔴⚪',
  '5': '🟢🔵',
  '6': '🟢⚪',
  '7': '🔵⚪',
  '8': '⚪⚪',
  '9': '🔵',
  A: '🔵🔴',
  B: '🟢🔴',
  C: '⚪🔴',
  D: '🔵🟢',
  E: '⚪🔵',
  F: '⚪',
  [BREAK_LINE]: '🌿', // 1 símbolo (indicador de nueva línea)
  [HEX_SEPARATOR]: '🚨', // 1 símbolo (indicador de separación),
  [SPACE]: '❌',
};

export const REVERSE_CODEBOOK = Object.fromEntries(
  Object.entries(CODEBOOK).map(([key, value]) => [value, key]),
);

// Define the icon-to-letter mapping
export const ICON_TO_LETTER_MAP: { [key in Icon]: string } = {
  '🔴': 'R',
  '🟢': 'G',
  '🔵': 'V',
  '⚪': 'W',
  '🌿': 'Y',
  '🚨': 'X',
  '❌': ' ',
};

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
export type LeftIconsKeys = 'A' | 'Q' | 'W' | 'S' | 'E' | 'D' | ' ';
export type RightIconsKeys = 'K' | 'I' | 'O' | 'L' | 'P' | 'Ñ';
// Definición de arrays de teclas
export const LEFT_ICONS_KEYS_ARRAY: ReadonlyArray<LeftIconsKeys> = [
  'A',
  'Q',
  'W',
  'S',
  'E',
  'D',
];
export const RIGHT_ICONS_KEYS_ARRAY: ReadonlyArray<RightIconsKeys> = [
  'K',
  'I',
  'O',
  'L',
  'P',
  'Ñ',
];
export type IconsKeys = LeftIconsKeys | RightIconsKeys;

// Mapeo simbólico de teclas a íconos
const KEY_GROUPS: Record<Icon, IconsKeys[]> = {
  '🔴': ['A', 'K'],
  '🟢': ['W', 'O'],
  '🔵': ['D', 'Ñ'],
  '⚪': ['S', 'L'],
  '🚨': ['Q', 'I'],
  '🌿': ['E', 'P'],
  '❌': [' ', ' '],
};

// Inicializar el mapeo de teclas a íconos con Partial para evitar el error inicial
const keyToIconMap: Partial<Record<IconsKeys, Icon>> = {};

// Llenar el objeto keyToIconMap usando el objeto de grupos de teclas
for (const [icon, keys] of Object.entries(KEY_GROUPS) as [
  Icon,
  IconsKeys[],
][]) {
  for (const key of keys) {
    keyToIconMap[key] = icon;
  }
}

// Asegurar a TypeScript que keyToIconMap ahora cumple con Record<Key, Icon>
export const KEY_TO_ICON = keyToIconMap as Record<IconsKeys, Icon>;

export const EMOJI_REGEX = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;
