import React from 'react';
import { Button } from '@/components/ui/button';

interface CopyableOutputProps {
  title: string;
  content: string;
  onCopy: (text: string) => void;
}

export const CopyableOutput: React.FC<CopyableOutputProps> = ({
  title,
  content,
  onCopy,
}) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold">{title}:</h3>
    </div>
    <div className="bg-gray-100 p-2 rounded overflow-x-auto">
      <p className="font-mono whitespace-pre-wrap break-words text-xl">
        {content}
      </p>
    </div>
    <br />
    <Button onClick={() => onCopy(content)}>Copy {title}</Button>
  </div>
);
