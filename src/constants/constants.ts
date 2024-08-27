export const CODEBOOK: { [p: string]: string } = {
  '0': '🔴🟢',  // 2 símbolos para 0
  '1': '🔴🔵',  // 2 símbolos para 1
  '\n': '🔴⚪', // 2 símbolos para nueva línea
  '2': '🟢🔴',  // 2 símbolos
  '3': '🟢🔵',  // 2 símbolos
  '4': '🟢⚪',  // 2 símbolos
  '5': '🔵🔴',  // 2 símbolos
  '6': '🔵🟢',  // 2 símbolos
  '7': '🔵⚪',  // 2 símbolos
  '8': '⚪🔴',  // 2 símbolos
  '9': '⚪🟢',  // 2 símbolos
  'A': '⚪🔵',  // 2 símbolos
  'B': '⚪⚪',  // 2 símbolos, evita prefijos comunes
  'C': '🔴🔴🟢', // 3 símbolos, para mantener unicidad
  'D': '🔴🔴🔵', // 3 símbolos, para mantener unicidad
  'E': '🔴🔴⚪', // 3 símbolos, para mantener unicidad
  'F': '🔴🟢🔴'  // 3 símbolos, para mantener unicidad
};

export const REVERSE_CODEBOOK = Object.fromEntries(
  Object.entries(CODEBOOK).map(([key, value]) => [value, key])
);
