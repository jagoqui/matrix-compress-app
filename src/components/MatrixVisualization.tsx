import React from 'react';
import { MatrixCanvas } from './MatrixCanvas'; // Import the MatrixCanvas component
import { Mode } from '@/models/commons.models';

interface MatrixVisualizationProps {
  mode: Mode;
  input: string;
  output: string;
}

export const MatrixVisualization: React.FC<MatrixVisualizationProps> = ({ mode, input, output }) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold">
        {mode === 'compress' ? 'Visualización de Matriz Comprimida' : 'Visualización de Matriz Descomprimida'}
      </h3>
      <MatrixCanvas input={mode === 'compress' ? input : output} />
    </div>
  );
};
