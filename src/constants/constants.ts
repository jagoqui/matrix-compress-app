export const CODEBOOK = {
    '0': 'RV',
    '1': 'RA',
    '2': 'AAA',
    '3': 'VR',
    '4': 'VA',
    '5': 'VB',
    '6': 'AR',
    '7': 'AV',
    '8': 'AB',
    '9': 'BR',
    'A': 'BV',
    'B': 'BA',
    'C': 'RRV',
    'D': 'RRA',
    'E': 'RRB',
    'F': 'RVR',
    '\n': 'RB'
  };
  
  export const REVERSE_CODEBOOK = Object.fromEntries(
    Object.entries(CODEBOOK).map(([key, value]) => [value, key])
  );