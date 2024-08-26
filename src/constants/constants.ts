export const CODEBOOK: {[p: string]: string} = {
    '0': '🔴🟢',
    '1': '🔴🔵',
    '2': '🔵🔵🔵',
    '3': '🟢🔴',
    '4': '🟢🔵',
    '5': '🟢⚪',
    '6': '🔵🔴',
    '7': '🔵🟢',
    '8': '🔵⚪',
    '9': '⚪🔴',
    'A': '⚪🟢',
    'B': '⚪🔵',
    'C': '🔴🔴🟢',
    'D': '🔴🔴🔵',
    'E': '🔴🔴⚪',
    'F': '🔴🟢🔴',
    '\n': '🔴⚪'
  };
  
  export const REVERSE_CODEBOOK = Object.fromEntries(
    Object.entries(CODEBOOK).map(([key, value]) => [value, key])
  );