'use client';

import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import { cn } from '@/lib/utils';
import {
  Icon,
  IconsKeys,
  LeftIconsKeys,
  RightIconsKeys,
  LEFT_ICONS_KEYS_ARRAY,
  RIGHT_ICONS_KEYS_ARRAY,
} from '@/constants/constants';
import { Mode } from '@/models/commons.models';
import { LayoutList } from 'lucide-react';

const KEY_GROUPS: Record<Icon, IconsKeys[]> = {
  '🔴': ['A', 'K'],
  '🟢': ['W', 'O'],
  '🔵': ['D', 'Ñ'],
  '⚪': ['S', 'L'],
  '🚨': ['Q', 'I'],
  '🌿': ['E', 'P'],
  '❌': [' ', ' '],
};

const LEFT_KEYS: (LeftIconsKeys | null)[][] = [
  ['Q', 'W', 'E'],
  ['A', 'S', 'D'],
  [null, null, null],
];

const RIGHT_KEYS: (RightIconsKeys | null)[][] = [
  ['I', 'O', 'P'],
  ['K', 'L', 'Ñ'],
  [null, null, null],
];

const HIGHLIGHTED_KEYS = new Set(['W', 'A', 'S', 'D', 'K', 'O', 'L', 'Ñ']);

const getKeyIcon = (key: IconsKeys): Icon => {
  return Object.entries(KEY_GROUPS).find(([_, keys]) =>
    keys.includes(key),
  )?.[0] as Icon;
};

interface KeyBoardPressViewerProps {
  handleKeyPress: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  parallelMode: Boolean;
  compressDecompressElementRef: MutableRefObject<HTMLTextAreaElement | null>;
  leftInputElementRef: MutableRefObject<HTMLTextAreaElement | null>;
  rightInputElementRef: MutableRefObject<HTMLTextAreaElement | null>;
}

interface CursorPosition {
  start: number;
  end: number;
}

interface ElementData {
  target: HTMLTextAreaElement | null;
  lastCursorPos: CursorPosition;
}

const getCursorPosition = (
  element: HTMLTextAreaElement | null,
): CursorPosition => {
  return {
    start: element?.selectionStart ?? 0,
    end: element?.selectionEnd ?? 0,
  };
};

export default function KeyBoardPressViewer({
  handleKeyPress,
  parallelMode,
  compressDecompressElementRef,
  leftInputElementRef,
  rightInputElementRef,
}: KeyBoardPressViewerProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<IconsKeys>>(new Set());

  const getCurrentElement = (key: IconsKeys): HTMLTextAreaElement | null => {
    const isLeftKey = LEFT_ICONS_KEYS_ARRAY.includes(key as LeftIconsKeys);
    if (parallelMode) {
      return isLeftKey
        ? leftInputElementRef?.current
        : rightInputElementRef?.current;
    }
    return compressDecompressElementRef?.current;
  };

  const simulateKeyPress = (key: IconsKeys) => {
    const target = getCurrentElement(key);

    const event = new KeyboardEvent('keydown', {
      key: key,
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, 'target', {
      writable: false,
      value: target,
    });

    handleKeyPress(
      event as unknown as React.KeyboardEvent<HTMLTextAreaElement>,
    );

    // Use setTimeout to ensure that the cursor is set after the key press event has been processed
    setTimeout(() => {
      if (!target) {
        return;
      }
      target.focus();
    }, 0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase() as IconsKeys;
      if ([...LEFT_KEYS.flat(), ...RIGHT_KEYS.flat()].includes(key)) {
        setPressedKeys((prev) => new Set(prev).add(key));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase() as IconsKeys;
      if ([...LEFT_KEYS.flat(), ...RIGHT_KEYS.flat()].includes(key)) {
        setPressedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    handleKeyPress,
    compressDecompressElementRef,
    leftInputElementRef,
    rightInputElementRef,
  ]);

  const handleMouseDown = (key: IconsKeys) => {
    setPressedKeys((prev) => new Set(prev).add(key));
    simulateKeyPress(key);
  };

  const handleMouseUp = (key: IconsKeys) => {
    setPressedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  };

  const renderKey = (key: IconsKeys | null) => {
    if (key === null) return <div className="w-20 h-20 m-1" />;
    const icon = getKeyIcon(key);
    const isHighlighted = HIGHLIGHTED_KEYS.has(key);
    const isPressed = pressedKeys.has(key);
    return (
      <button
        key={key}
        className={cn(
          'w-20 h-20 m-1 text-2xl font-bold rounded-lg shadow-lg',
          'transition-all duration-100 ease-in-out',
          'focus:outline-none flex flex-col items-center justify-center',
          'relative overflow-hidden',
          isHighlighted && 'border-4 border-primary',
          isPressed
            ? 'bg-primary text-primary-foreground transform translate-y-1 shadow-inner'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          !isPressed &&
            'before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent',
          !isPressed &&
            'after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:opacity-50',
        )}
        onMouseDown={() => handleMouseDown(key)}
        onMouseUp={() => handleMouseUp(key)}
        onMouseLeave={() => handleMouseUp(key)}
      >
        <span className="text-3xl mb-1" aria-hidden="true">
          {icon}
        </span>
        <span className="text-lg uppercase">{key}</span>
      </button>
    );
  };

  const renderKeyBlock = (keys: (IconsKeys | null)[][]) => (
    <div className="flex flex-col items-center w-full">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center w-full">
          {row.map((key, keyIndex) => (
            <React.Fragment key={keyIndex}>{renderKey(key)}</React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center pv-8 bg-gray-100 w-full">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <div className="w-full md:w-5/12 mb-8 md:mb-0">
            {renderKeyBlock(LEFT_KEYS)}
          </div>
          <div className="w-full md:w-5/12">{renderKeyBlock(RIGHT_KEYS)}</div>
        </div>
      </div>
      <br />
    </div>
  );
}
