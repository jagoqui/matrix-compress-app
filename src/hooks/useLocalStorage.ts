import { useState, useEffect } from 'react';

export const useLocalStorage = (key: string, initialValue: string) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? item : initialValue;
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: string | ((prev: string) => string)) => {
    try {
      setStoredValue((prev) => {
        const newValue =
          typeof value === 'function'
            ? (value as (prev: string) => string)(prev)
            : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, newValue);
        }
        return newValue;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};
