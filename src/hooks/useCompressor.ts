import { useState, useEffect, KeyboardEvent } from 'react';
import { 
  ALLOWED_ICONS_REGEX, 
  CLEANED_ICONS_REGEX, 
  CODEBOOK, 
  IconsKeys, 
  KEY_TO_ICON, 
  LEFT_ICONS_KEYS_ARRAY, 
  LeftIconsKeys, 
  REVERSE_CODEBOOK, 
  RIGHT_ICONS_KEYS_ARRAY, 
  RightIconsKeys 
} from '../constants/constants';
import { Mode } from '@/models/commons.models';

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
    setInput(savedInput ?? '');
  }, [mode, inputMode]);

  useEffect(() => {
    localStorage.setItem(mode, input);
  }, [input]); 
  
  useEffect(() => {
    processInput(input);
  }, [mode, input]);

  const countIcons = (text: string) => {
    return text.match(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu)?.length || 0;
  };

  const compress = (text: string) => {
    const rows = text.split('\n');
    const binaryRows = rows.filter(row => /^[01\n]+$/.test(row));
    const maxColumnRow = binaryRows.reduce(
      (maxRow, currentRow) => (currentRow.length > (maxRow?.length ?? 0) ? currentRow : maxRow), 
      ''
    );

    return rows.map(row => {
      const currentRowIsBinary = binaryRows.includes(row);
      if (currentRowIsBinary) {
        const rowToEncode = row === maxColumnRow ? row : row.replace(/0+$/, '');
        return rowToEncode.split('').map(char => CODEBOOK[char.toUpperCase()] || char).join('');
      } else {
        return row.split('').map(char => CODEBOOK[char.toUpperCase()] || char).join(CODEBOOK['|']);
      }
    }).join(CODEBOOK['\n']);
  };

  const decompress = (text: string) => {
    if (!ALLOWED_ICONS_REGEX.test(text)) {
      return ''; 
    }

    const rows = text.split(CODEBOOK['\n']);
    let result = rows.map(row => {
      if (row.includes(CODEBOOK['|'])) {
        return row.split(CODEBOOK['|']).map(code => REVERSE_CODEBOOK[code] || code).join('');
      } else {
        return row.split('').map(char => REVERSE_CODEBOOK[char] || char).join('');
      }
    }).join('\n');

    const resultRows = result.split('\n');
    const binaryRows = resultRows.filter(row => /^[01]+$/.test(row));
    const maxBinaryRowLength = Math.max(...binaryRows.map(row => row.length));

    const normalizedBinaryRows = binaryRows.map(row => row.padEnd(maxBinaryRowLength, '0'));
    let binaryRowIndex = 0;

    return resultRows.map(row => {
      if (/^[01]+$/.test(row)) {
        return normalizedBinaryRows[binaryRowIndex++];
      }
      return row;
    }).join('\n').trim();
  };

  const processInput = (text: string) => {
    const processedOutput = mode === 'compress' ? compress(text) : decompress(text);
    setOutput(processedOutput);
    setCharCount({
      before: mode === 'compress' ? text.length : countIcons(text),
      after: countIcons(processedOutput),
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
    const sanitizedValue = mode === 'compress' 
      ? value.replace(/[^0-9A-Fa-f\n]/g, '').toUpperCase()
      : value.replace(CLEANED_ICONS_REGEX, '');

    if (inputMode === 'serial') {
      setInput(sanitizedValue);
    } else if (index !== undefined) {
      setParallelInput(prev => {
        const newInput = [...prev];
        newInput[index] = sanitizedValue;
        return newInput;
      });
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>, index?: number) => {
    if (mode === 'decompress') {
      const key = e.key.toLowerCase();
      const icon = KEY_TO_ICON[key as IconsKeys];
      if (!icon) return;

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
    handleKeyPress,
  };
};
