import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MatrixCanvas } from './MatrixCanvas';
import { useCompressor } from '../hooks/useCompressor';
import { CODEBOOK, Icon, ICON_TO_LETTER_MAP } from '../constants/constants';
import KeyBoardPressViewer from './KeyboardPressViewer';

export const CompressApp: React.FC = () => {
  const {
    mode,
    setMode,
    inputMode,
    setInputMode,
    input,
    parallelInput,
    output,
    charCount,
    handleReset,
    handleInputChange,
    handleKeyPress
  } = useCompressor();
  
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [letterCodebookOutput, setLetterCodebookOutput] = useState('');

  const handleCopy = (textToCopy: string, message: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyMessage(message);
      setShowCopyModal(true);
    });
  };

  // Función para transformar el output usando LETTER_CODEBOOK
  const transformOutputToLetterCodebook = (text: string): string => {
    const iconRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu; // Expresión regular para encontrar íconos
    const icons = text.match(iconRegex) || []; // Obtener todos los íconos en el texto
    
    return icons.map(icon => {
      const letter = ICON_TO_LETTER_MAP[icon as Icon] || icon; // Mapear el ícono a su letra correspondiente
      return letter;
    }).join('');
  };

  // useEffect para actualizar el estado de letterCodebookOutput cuando output cambia
  useEffect(() => {
    if(!output){
      return;
    }
    const transformedOutput = transformOutputToLetterCodebook(output);
    setLetterCodebookOutput(transformedOutput);
  }, [output]);

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
          {mode === 'decompress' && (
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="input-mode-switch"
                checked={inputMode === 'parallel'}
                onCheckedChange={(checked) => setInputMode(checked ? 'parallel' : 'serial')}
              />
              <Label htmlFor="input-mode-switch">
                Modo de entrada: {inputMode === 'serial' ? 'Serial' : 'Paralelo'}
              </Label>
            </div>
          )}
          {mode === 'decompress' && inputMode === 'parallel' ? (
            <div className="flex space-x-2 mb-4">
              <Textarea
                placeholder="Parte inicial presione las teclas de la izquierda."
                value={parallelInput[0]}
                onChange={(e) => handleInputChange(e.target.value, 0)}
                onKeyPress={(e) => handleKeyPress(e)}
                className="mb-4 font-mono text-lg h-40 w-1/2"
              />
              <Textarea
                placeholder="Parte final, presione las teclas de la derecha"
                value={parallelInput[1]}
                onChange={(e) => handleInputChange(e.target.value, 1)}
                onKeyPress={(e) => handleKeyPress(e)}
                className="mb-4 font-mono text-lg h-40 w-1/2"
              />
            </div>
          ) : (
            <Textarea
              placeholder={mode === 'compress' ? "Ingrese el texto a comprimir" : "Ingrese el texto codificado a descomprimir"}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e)}
              className="mb-4 font-mono text-lg h-40"
            />
          )}
          {
            mode === 'decompress' && (
              <KeyBoardPressViewer />
            )
          }
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Visualización de Matriz de Entrada:</h3>
            <MatrixCanvas input={mode === 'compress' ? input : output} />
          </div>

          {/* Salida usando CODEBOOK */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Salida usando CODEBOOK (Íconos):</h3>
            <Textarea
              value={output}
              readOnly
              className="mb-4 font-mono text-lg h-40 whitespace-pre-wrap cursor-text"
            />
            <Button onClick={() => handleCopy(output, 'Salida con CODEBOOK copiada al portapapeles')}>
              Copiar Salida Descompresor
            </Button>
          </div>

          {/* Salida usando LETTER_CODEBOOK */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Salida usando LETTER_CODEBOOK (Letras):</h3>
            <Textarea
              value={letterCodebookOutput}
              readOnly
              className="mb-4 font-mono text-lg h-40 whitespace-pre-wrap cursor-text"
            />
            <Button onClick={() => handleCopy(letterCodebookOutput, 'Salida para ARDUINO copiada al portapapeles')}>
              Copiar Salida Para ARDUINO
            </Button>
          </div>

          <div className="mb-4">
            <p>Caracteres antes: {charCount.before}</p>
            <p>Caracteres después: {charCount.after}</p>
          </div>

          {/* Mostrar ambos Codebooks */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Codebook Descompresor:</h3>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(CODEBOOK, null, 2)}
            </pre>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Codebook ARDUINO:</h3>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(ICON_TO_LETTER_MAP, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copiado al portapapeles</DialogTitle>
            <DialogDescription>
              {copyMessage}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
