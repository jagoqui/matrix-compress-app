import { KEY_TO_ICON } from '@/constants/constants';
import { KeyboardEvent } from 'react';

type Mode = 'compress' | 'decompress';
type InputMode = 'serial' | 'parallel';

export const handleInputChange = (
  mode: Mode, 
  inputMode: InputMode, 
  value: string, 
  setInput: React.Dispatch<React.SetStateAction<string>>, 
  setParallelInput: React.Dispatch<React.SetStateAction<string[]>>, 
  index?: number
) => {
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

export const handleKeyPress = (
  mode: Mode, 
  inputMode: InputMode, 
  e: KeyboardEvent<HTMLTextAreaElement>, 
  setInput: React.Dispatch<React.SetStateAction<string>>, 
  setParallelInput: React.Dispatch<React.SetStateAction<string[]>>
) => {
  if (mode === 'decompress') {
    const key = e.key.toLowerCase();
    const icon = KEY_TO_ICON[key] || '';
    
    if (icon) {
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
  }
};
