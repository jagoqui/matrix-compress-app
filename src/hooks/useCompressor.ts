import { useState, useEffect } from 'react';
import { CODEBOOK, REVERSE_CODEBOOK } from '../constants/constants';

export const useCompressor = (initialMode: 'compress' | 'decompress' = 'compress') => {
  const [mode, setMode] = useState(initialMode);
  const [input, setInput] = useState('');
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
    return text.split('').map(char => CODEBOOK[char.toUpperCase()] || char).join('');
  };

  const decompress = (text: string) => {
    let result = '';
    let buffer = '';
    for (let char of text) {
      buffer += char;
      if (REVERSE_CODEBOOK[buffer]) {
        result += REVERSE_CODEBOOK[buffer];
        buffer = '';
      }
    }
    return result;
  };

  const processInput = (text: string) => {
    const processedOutput = mode === 'compress' ? compress(text) : decompress(text);
    setOutput(processedOutput);
    setCharCount({
      before: mode === 'compress' ? text.length : countIcons(text),
      after: mode === 'compress' ? countIcons(processedOutput) : processedOutput.length
    });
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setCharCount({ before: 0, after: 0 });
    localStorage.removeItem(mode);
  };

  return {
    mode,
    setMode,
    input,
    setInput,
    output,
    charCount,
    handleReset,
    processInput
  };
};