import { useState, useEffect, KeyboardEvent } from 'react';
import {
  ALLOWED_ICONS_REGEX,
  BREAK_LINE,
  CLEANED_ICONS_REGEX,
  CODEBOOK,
  EMOJI_REGEX,
  HEX_SEPARATOR,
  IconsKeys,
  KEY_TO_ICON,
  LEFT_ICONS_KEYS_ARRAY,
  LeftIconsKeys,
  REVERSE_CODEBOOK,
} from '../constants/constants';
import { Mode } from '@/models/commons.models';
import { useLocalStorage } from './useLocalStorage';

const EXAMPLE_MATRIX = `DA705901AB9D
01111110
11011011
11111111
00111100
11011011
01100110
00111100
01111110
11111111
11011011`;

type InputMode = 'serial' | 'parallel';

export const useCompressor = (initialMode: Mode = 'compress') => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [inputMode, setInputMode] = useState<InputMode>('serial');
  const [input, setInput] = useLocalStorage(mode, EXAMPLE_MATRIX);
  const [parallelInput, setParallelInput] = useState(['', '']);
  const [output, setOutput] = useState('');
  const [charCount, setCharCount] = useState({ before: 0, after: 0 });

  useEffect(() => {
    const savedInput = localStorage.getItem(mode);
    setInput(savedInput?.length ? savedInput : '');
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(mode, input);
  }, [input]);

  useEffect(() => {
    processInput(input);
  }, [mode, input]);

  const countIcons = (text: string) => {
    return text.match(EMOJI_REGEX)?.length || 0;
  };

  const compress = (text: string) => {
    const rows = text.split(BREAK_LINE);
    const binaryRows = rows.filter((row) => /^[01\n]+$/.test(row));
    // Encuentra la fila con el máximo número de columnas, en caso de empate, con menos ceros al final
    const maxColumnRow = binaryRows.reduce((maxRow, currentRow) => {
      const currentRowTrimmedLength = currentRow.replace(/0+$/, '').length;
      const maxRowTrimmedLength = maxRow.replace(/0+$/, '').length;

      // Compara primero por longitud, luego por cantidad de ceros al final si hay empate en longitud
      if (currentRow.length > maxRow.length) {
        return currentRow;
      } else if (currentRow.length === maxRow.length) {
        return currentRowTrimmedLength > maxRowTrimmedLength
          ? currentRow
          : maxRow;
      } else {
        return maxRow;
      }
    }, '');

    let foundFirstMaxColumnRowMatch = false;
    return rows
      .map((row, index) => {
        const currentRowIsBinary = binaryRows.includes(row);
        if (currentRowIsBinary) {
          const currentRowIsEqualToMaxColumnRow = row === maxColumnRow;
          const rowToEncode =
            currentRowIsEqualToMaxColumnRow && !foundFirstMaxColumnRowMatch
              ? row
              : row.replace(/0+$/, '');
          if (!foundFirstMaxColumnRowMatch && currentRowIsEqualToMaxColumnRow) {
            foundFirstMaxColumnRowMatch = true;
          }
          return rowToEncode
            .split('')
            .map((char) => CODEBOOK[char.toUpperCase()] || char)
            .join('');
        }
        return row
          .split('')
          .map((char) => CODEBOOK[char.toUpperCase()] || char)
          .join(CODEBOOK['|']);
      })
      .join(CODEBOOK[BREAK_LINE]);
  };

  const decompress = (text: string) => {
    if (!ALLOWED_ICONS_REGEX.test(text)) {
      return '';
    }

    const rows = text.split(CODEBOOK[BREAK_LINE]);
    let result = rows
      .map((row) => {
        const currentRowHasHexSeparators = row.includes(
          CODEBOOK[HEX_SEPARATOR],
        );
        if (currentRowHasHexSeparators) {
          const rowWithHexValues = row.split(CODEBOOK[HEX_SEPARATOR]);
          return rowWithHexValues
            .map((code) => REVERSE_CODEBOOK[code] || code)
            .join('');
        }
        return row.replace(
          EMOJI_REGEX,
          (match) => REVERSE_CODEBOOK[match] || match,
        );
      })
      .join(BREAK_LINE);

    const resultRows = result.split(BREAK_LINE);
    const binaryRows = resultRows.filter((row) => /^[01]+$/.test(row));
    const maxBinaryRowLength = Math.max(...binaryRows.map((row) => row.length));

    const normalizedBinaryRows = binaryRows.map((row) =>
      row.padEnd(maxBinaryRowLength, '0'),
    );
    let binaryRowIndex = 0;

    return resultRows
      .map((row) => {
        if (/^[01]+$/.test(row)) {
          return normalizedBinaryRows[binaryRowIndex++];
        }
        return row;
      })
      .join(BREAK_LINE)
      .trim();
  };

  const processInput = (text: string) => {
    const processedOutput =
      mode === 'compress' ? compress(text) : decompress(text);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Get the textarea element and its current cursor position
    const target = e.target as HTMLTextAreaElement;
    const { value, id } = target;
    if (mode === 'compress' || inputMode === 'serial') {
      setInput(value);
    } else {
      const isLeftInput = id === 'left';
      setParallelInput((prev) => {
        const newInput = [...prev];
        newInput[isLeftInput ? 0 : 1] = value;
        return newInput;
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Get the textarea element and its current cursor position
    const target = e.target as HTMLTextAreaElement;
    const { selectionStart, selectionEnd } = target;
    const upperCasedKey = e.key.toUpperCase();
    // Determine sanitized value based on the mode and the key pressed
    const sanitizedValue =
      mode === 'compress'
        ? e.key === 'Enter'
          ? '\n' // Replace Enter with a newline character
          : upperCasedKey.replace(/[^0-9A-Fa-f]/g, '') // Allow only hex characters
        : upperCasedKey.replace(
            CLEANED_ICONS_REGEX,
            KEY_TO_ICON[upperCasedKey as IconsKeys] ?? '',
          );
    // Si no hay valor sanitizado, previene la acción predeterminada y la propagación
    if (!(sanitizedValue && sanitizedValue.length)) {
      return;
    }

    if (mode === 'compress') {
      setInput(
        (prev: string) =>
          prev.substring(0, selectionStart) +
          sanitizedValue +
          prev.substring(selectionEnd),
      );
    } else {
      if (inputMode === 'serial') {
        setInput(
          (prev) =>
            prev.substring(0, selectionStart) +
            sanitizedValue +
            prev.substring(selectionEnd),
        );
      } else {
        const pressLeftKeys = LEFT_ICONS_KEYS_ARRAY.includes(
          upperCasedKey as LeftIconsKeys,
        );
        const index = pressLeftKeys ? 0 : 1;
        setParallelInput((prev) => {
          const newInput = [...prev];
          newInput[index] =
            prev[index].substring(0, selectionStart) +
            sanitizedValue +
            prev[index].substring(selectionEnd);
          return newInput;
        });
      }
    }
    // Ajusta la posición del cursor después de actualizar el input
    setTimeout(() => {
      target.selectionStart = selectionStart + sanitizedValue.length;
      target.selectionEnd = selectionStart + sanitizedValue.length;
    }, 0);
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
