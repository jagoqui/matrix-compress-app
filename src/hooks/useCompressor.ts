import { useState, useEffect, KeyboardEvent } from 'react';
import { CODEBOOK, REVERSE_CODEBOOK } from '../constants/constants';
import { handleInputChange, handleKeyPress } from '../utils/useCompressorHandlers';

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
    return text
      .split('\n')
      .map(row => {
        // Verificar si la fila contiene solo '0', '1' o '\n'
        const containsOnlyBinary = row.split('').every(char => char === '0' || char === '1' || char === '\n');

        if (containsOnlyBinary) {
          // Codificar la fila sin agregar \n entre caracteres
          return row
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
    return result;
  };

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
    handleInputChange: (value: string, index?: number) => handleInputChange(mode, inputMode, value, index, setInput, setParallelInput),
    handleKeyPress: (e: KeyboardEvent<HTMLTextAreaElement>, index?: number) => handleKeyPress(mode, inputMode, e, setInput, setParallelInput)
  };
};
