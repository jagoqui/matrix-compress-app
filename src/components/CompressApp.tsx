"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MatrixCanvas } from './MatrixCanvas';
import { useCompressor } from '../hooks/useCompressor';
import { CODEBOOK } from '../constants/constants';

export const CompressApp: React.FC = () => {
    const { mode, setMode, input, setInput, output, charCount, handleReset, processInput } = useCompressor();
    const [showCopyModal, setShowCopyModal] = useState(false);
  
    const handleCopy = () => {
      const textToCopy = mode === 'compress' ? output : input;
      navigator.clipboard.writeText(textToCopy).then(() => {
        setShowCopyModal(true);
      });
    };
  
    return (
      <div className="container mx-auto p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Compresor/Descompresor de Matriz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="mode-switch"
                checked={mode === 'decompress'}
                onCheckedChange={(checked) => setMode(checked ? 'decompress' : 'compress')}
              />
              <Label htmlFor="mode-switch">
                Modo: {mode === 'compress' ? 'Comprimir' : 'Descomprimir'}
              </Label>
            </div>
            <Textarea
              placeholder={mode === 'compress' ? "Ingrese el texto a comprimir" : "Ingrese el texto codificado a descomprimir"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mb-4 font-mono text-lg h-40" // Added monospace font, larger text, and increased height
            />
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Visualización de Matriz de Entrada:</h3>
              <MatrixCanvas input={mode === 'compress' ? input : output} />
            </div>
            <div className="flex space-x-2 mb-4">
              <Button onClick={handleReset}>Reiniciar</Button>
              <Button onClick={handleCopy}>Copiar {mode === 'compress' ? 'Salida Codificada' : 'Entrada Codificada'}</Button>
            </div>
            <Textarea
              value={output}
              readOnly
              className="mb-4 font-mono text-lg h-40 whitespace-pre-wrap" // Added monospace font, larger text, increased height, and word wrap
            />
            <div className="mb-4">
              <p>Caracteres antes: {charCount.before}</p>
              <p>Caracteres después: {charCount.after}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Codebook:</h3>
              <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(CODEBOOK, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
        <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Copiado al portapapeles</DialogTitle>
              <DialogDescription>
                {mode === 'compress' ? 'La salida codificada' : 'La entrada codificada'} ha sido copiada al portapapeles.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    );
  };