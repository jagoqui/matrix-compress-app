import { useState, useEffect, KeyboardEvent } from 'react';
import { ALLOWED_ICONS_REGEX, CLEANED_ICONS_REGEX, CODEBOOK, IconsKeys, KEY_TO_ICON, LEFT_ICONS_KEYS_ARRAY, LeftIconsKeys, REVERSE_CODEBOOK, RIGHT_ICONS_KEYS_ARRAY, RightIconsKeys } from '../constants/constants';

type Mode = 'compress' | 'decompress';
type InputMode = 'serial' | 'parallel';

export const useCompressor = (initialMode: Mode = 'compress') => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [inputMode, setInputMode] = useState<InputMode>('serial');
  const [input, setInput] = useState(`da705901ab9d
01111110
11011011
11111111
00111100
11011011
01100110
00111100
01111110
11111111
11011011`);
  const [parallelInput, setParallelInput] = useState(['', '']);
  const [output, setOutput] = useState('');
  const [charCount, setCharCount] = useState({ before: 0, after: 0 });

  useEffect(() => {
    const savedInput = localStorage.getItem(mode);
    if (savedInput) setInput(savedInput);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(mode, input);
    processInput(input);
  }, [mode, input]);

  const countIcons = (text: string) => {
    return text.match(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu)?.length || 0;
  };

  const compress = (text: string) => {
    const rows = text.split('\n');
  
     // Filtrar las filas binarias
     const binaryRows = rows.filter(row => /^[01\n]+$/.test(row));
    
     // Identificar la fila binaria con más columnas (más caracteres)
     const maxColumnRow = binaryRows.reduce((maxRow, currentRow) => 
         currentRow.length > (maxRow?.length ?? 0) ? currentRow : maxRow, 
         ''
     );
  
    return rows
      .map(row => {
        const currentRowIsBinary = binaryRows.some((binRow) => binRow === row);
        if (currentRowIsBinary) {
          // Eliminar ceros consecutivos al final en todas las filas, excepto en la fila con la mínima cantidad de ceros al final
          const rowToEncode = row === maxColumnRow 
            ? row 
            : row.replace(/0+$/, '');
  
          return rowToEncode
            .split('')
            .map(char => CODEBOOK[char.toUpperCase()] || char)
            .join('');
        } else{
          const encodedRow = row
            .split('')
            .map(char => CODEBOOK[char.toUpperCase()] || char)
            .join(CODEBOOK['|']); //Agrega separador a los caracteres
          return encodedRow;
        }
      })
      .join(CODEBOOK['\n']);
  };
  
  const decompress = (text: string) => {
    // Verificar si el texto contiene solo los caracteres permitidos
    if (!ALLOWED_ICONS_REGEX.test(text)) {
        return ''; // Retornar si se encuentra un carácter no permitido
    }

    let result = '';
    const rows = text.split(CODEBOOK['\n']); // Separar las filas usando CODEBOOK['\n']

    // Identificar y procesar filas de letras y filas binarias
    rows.forEach((row, index) => {
        if (row.includes(CODEBOOK['|'])) {
            // Fila de letras
            const charCodes = row.split(CODEBOOK['|']);
            let decodedRow = charCodes.map(code => REVERSE_CODEBOOK[code] || code).join('');
            if (index < rows.length - 1) {
                // Si no es la última fila, agregar \n
                decodedRow += '\n';
            }
            result += decodedRow;
        } else {
            // Fila binaria, decodificar símbolo a símbolo
            for (let char of row) {
                result += REVERSE_CODEBOOK[char] || char;
            }
            result += '\n'; // Agregar \n después de cada fila binaria
        }
    });

    // Dividir el resultado en filas para aplicar padding a las filas binarias
    const resultRows = result.split('\n');

    // Filtrar filas binarias
    const binaryRows = resultRows.filter(row => /^[01]+$/.test(row));

    // Encontrar la longitud máxima de fila binaria
    const maxBinaryRowLength = binaryRows.reduce((max, row) => Math.max(max, row.length), 0);

    // Normalizar tamaño de las filas binarias con padding
    const normalizedBinaryRows = binaryRows.map(row =>
        row.length < maxBinaryRowLength
            ? row.padEnd(maxBinaryRowLength, '0')
            : row
    );

    // Reensamblar el texto con filas normalizadas
    let normalizedResult = '';
    let binaryRowIndex = 0;

    for (let row of resultRows) {
        if (/^[01]+$/.test(row)) {
            normalizedResult += normalizedBinaryRows[binaryRowIndex] + '\n';
            binaryRowIndex++;
        } else {
            normalizedResult += row + '\n';
        }
    }

    return normalizedResult.trim(); // Elimina el último salto de línea extra
  };

  
  // TODO: Extraer codigo aparte
  const processInput = (text: string) => {
    const processedOutput = mode === 'compress' ? compress(text) : decompress(text);
    setOutput(processedOutput);
    setCharCount({
      before: mode === 'compress' ? text.length : countIcons(text),
      after: countIcons(processedOutput)
    });
  };

  const handleReset = () => {
    setInput('');
    setParallelInput(['', '']);
    setOutput('');
    setCharCount({ before: 0, after: 0 });
    localStorage.removeItem(mode);
  };

  const handleInputChange = (value: string, index?: number) => {
    if (mode === 'compress') {
      const sanitizedValue = value.replace(/[^0-9A-Fa-f\n]/g, '').toUpperCase();
      setInput(sanitizedValue);
    } else {
      const sanitizedValue = value.replace(CLEANED_ICONS_REGEX, '');
      if (inputMode === 'serial') {
        setInput(sanitizedValue);
      } else if (index !== undefined) {
        setParallelInput(prev => {
          const newInput = [...prev];
          newInput[index] = sanitizedValue;
          return newInput;
        });
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>, index?: number) => {
    if (mode === 'decompress') {
      const key = e.key.toLowerCase();
      const icon = KEY_TO_ICON[key as IconsKeys] ?? null;
      if(!icon){
        return; 
      }
      e.preventDefault();

      if (inputMode === 'serial') {
        setInput(prev => prev + icon);
      } else {
        setParallelInput(prev => {
          const newInput = [...prev];
          if (LEFT_ICONS_KEYS_ARRAY.includes(key as LeftIconsKeys)) {
            newInput[0] += icon;
          } else if (RIGHT_ICONS_KEYS_ARRAY.includes(key as RightIconsKeys)) {
            newInput[1] += icon;
          }
          return newInput;
        });
      }
    }
  };

  useEffect(() => {
    if (inputMode === 'parallel') {
      setInput(parallelInput[0] + parallelInput[1]);
    }
  }, [parallelInput, inputMode]);

  return {
    mode,
    setMode,
    inputMode,
    setInputMode,
    input,
    setInput,
    parallelInput,
    setParallelInput,
    output,
    charCount,
    handleReset,
    processInput,
    handleInputChange,
    handleKeyPress
  };
};
