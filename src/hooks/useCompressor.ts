import { useState, useEffect, KeyboardEvent } from 'react';
import { CODEBOOK, REVERSE_CODEBOOK } from '../constants/constants';

type Mode = 'compress' | 'decompress';
type InputMode = 'serial' | 'parallel';

export const useCompressor = (initialMode: Mode = 'compress') => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [inputMode, setInputMode] = useState<InputMode>('serial');
  const [input, setInput] = useState('');
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
  
    const binaryRows = rows.filter(row => /^[01\n]+$/.test(row));
    // Ordenar las filas según la cantidad de ceros al final, de mayor a menor
    const sortedRows = [...binaryRows].sort((a, b) => {
      const trailingZerosA = (a.match(/0+$/) || [''])[0].length;
      const trailingZerosB = (b.match(/0+$/) || [''])[0].length;
      return trailingZerosB - trailingZerosA; // Ordenar de mayor a menor
    });
  
    // Identificar la fila binarioa con la menor cantidad de ceros al final (última en el orden)
    const minTrailingZeroRow = sortedRows[sortedRows.length - 1] ?? null;
  
    return rows
      .map(row => {
        const currentRowIsBinary = binaryRows.some((binRow) => binRow === binRow);
  
        if (currentRowIsBinary) {
          // Eliminar ceros consecutivos al final en todas las filas, excepto en la fila con la mínima cantidad de ceros al final
          const rowToEncode = row === minTrailingZeroRow 
            ? row 
            : row.replace(/0+$/, '');
  
          return rowToEncode
            .split('')
            .map(char => CODEBOOK[char.toUpperCase()] || char)
            .join('');
        } else {
          // Codificar la fila con \n entre caracteres
          let encodedRow = row
            .split('')
            .map(char => CODEBOOK[char.toUpperCase()] || char)
            .join('\n');
  
          // Verificar si la fila original termina en \n y conservarlo al final
          if (row.endsWith('\n')) {
            return encodedRow + '\n';
          } else {
            // Eliminar los \n intermedios dejando solo el último si existe
            return encodedRow.replace(/\n/g, '');
          }
        }
      })
      .join('\n');
  };
  
  const decompress = (text: string) => {
    let result = '';
    let buffer = '';
    
    // Descompresión del texto usando REVERSE_CODEBOOK
    for (let char of text) {
      if (char === '\n') {
        // Si encontramos un salto de línea, procesamos lo que haya en el buffer
        if (buffer) {
          result += REVERSE_CODEBOOK[buffer] || buffer;
          buffer = '';
        }
        result += '\n'; // Añadimos el salto de línea al resultado
      } else {
        buffer += char;
        if (REVERSE_CODEBOOK[buffer]) {
          result += REVERSE_CODEBOOK[buffer];
          buffer = '';
        }
      }
    }
    
    // Procesar cualquier código residual en el buffer
    if (buffer) {
      result += REVERSE_CODEBOOK[buffer] || buffer;
    }
  
    // Dividir el resultado en filas
    const rows = result.split('\n');
    
    // Filtrar filas binarias
    const binaryRows = rows.filter(row => /^[01]+$/.test(row));
  
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
  
    for (let row of rows) {
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
      const sanitizedValue = value.replace(/[^🔴🟢🔵⚪\n]/g, '');
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
      let icon = '';
      switch (key) {
        case 'a': icon = '🔴'; break;
        case 'w': icon = '🟢'; break;
        case 'd': icon = '🔵'; break;
        case 's': icon = '⚪'; break;
        case 'j': icon = '🔴'; break;
        case 'i': icon = '🟢'; break;
        case 'l': icon = '🔵'; break;
        case 'k': icon = '⚪'; break;
        default: return;
      }
      e.preventDefault();

      if (inputMode === 'serial') {
        setInput(prev => prev + icon);
      } else {
        setParallelInput(prev => {
          const newInput = [...prev];
          if (['a', 'w', 'd', 's'].includes(key)) {
            newInput[0] += icon;
          } else if (['j', 'i', 'l', 'k'].includes(key)) {
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
