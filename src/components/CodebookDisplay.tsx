import React from 'react';
import { CODEBOOK, ICON_TO_LETTER_MAP } from '@/constants/constants';

export const CodebookDisplay: React.FC = () => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold mb-2">CODEBOOK:</h3>
    <div className="grid grid-cols-4 gap-4">
      <pre className="bg-gray-100 p-2 rounded">
        {JSON.stringify(CODEBOOK, null, 2)}
      </pre>
    </div>
    <h3 className="text-lg font-semibold mb-2 mt-4">LETTER CODEBOOK:</h3>
    <div className="grid grid-cols-4 gap-4">
      <pre className="bg-gray-100 p-2 rounded">
        {JSON.stringify(ICON_TO_LETTER_MAP, null, 2)}
      </pre>
    </div>
  </div>
);
