import React, { useEffect, useRef } from 'react';

interface MatrixCanvasProps {
  input: string;
}

export const MatrixCanvas: React.FC<MatrixCanvasProps> = ({ input }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 30; // Increased cell size
    const rows = input.split('\n');
    const maxWidth = Math.max(...rows.map((row) => row.length));

    canvas.width = maxWidth * cellSize;
    canvas.height = rows.length * cellSize;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rows.forEach((row, y) => {
      const isPixelRow = row
        .split('')
        .every((char) => char === '0' || char === '1' || char === '\n');

      if (isPixelRow) {
        Array.from(row).forEach((char, x) => {
          ctx.fillStyle = char === '1' ? 'black' : 'white';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          ctx.strokeStyle = 'gray';
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        });
      } else {
        ctx.fillStyle = 'black';
        ctx.font = '24px monospace'; // Increased font size and changed to monospace
        ctx.fillText(row, 5, y * cellSize + 18);
      }
    });
  }, [input]);

  return <canvas ref={canvasRef} />;
};
