import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCompressor } from '../hooks/useCompressor';
import { SwitchWithLabel } from './SwitchWithLabel';
import { CustomTextArea } from './CustomTextArea';
import { CopyableOutput } from './CopyableOutput';
import { CodebookDisplay } from './CodebookDisplay';
import KeyBoardPressViewer from './KeyboardPressViewer';
import { Icon, ICON_TO_LETTER_MAP } from '@/constants/constants';
import { MatrixVisualization } from './MatrixVisualization';
import { Button } from './ui/button';

export const CompressApp: React.FC = () => {
  const {
    mode,
    setMode,
    inputMode,
    handleReset,
    setInputMode,
    input,
    parallelInput,
    output,
    charCount,
    handleInputChange,
    handleKeyPress,
  } = useCompressor();

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [letterCodebookOutput, setLetterCodebookOutput] = useState('');

  const compressDecompressElementRef = useRef<HTMLTextAreaElement | null>(null);
  const leftInputElementRef = useRef<HTMLTextAreaElement | null>(null);
  const rightInputElementRef = useRef<HTMLTextAreaElement | null>(null);

  const handleCopy = (textToCopy: string, message: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyMessage(message);
      setShowCopyModal(true);
    });
  };

  const transformOutputToLetterCodebook = (text: string): string => {
    const iconRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;
    const icons = text.match(iconRegex) || [];
    return icons
      .map((icon) => {
        const letter = ICON_TO_LETTER_MAP[icon as Icon] || icon;
        return letter;
      })
      .join('');
  };

  const autoFocusInput = (element: HTMLTextAreaElement | null): void => {
    if (!element) {
      return;
    }
    element.focus();
    const { length } = element.value;
    element.setSelectionRange(length, length);
  };

  const inputModeToggle = (parallel: boolean): void =>{
    const length = compressDecompressElementRef?.current?.value?.length;
    if(parallel && length ){
      if(!confirm('¿Seguro que desea cambiar de modo?, se perderá los datos.')){
        return;
      }
    }
    setInputMode(parallel ? 'parallel' : 'serial')
  }

  useEffect(() => {
    if (!output) {
      return;
    }
    const transformedOutput = transformOutputToLetterCodebook(output);
    setLetterCodebookOutput(transformedOutput);
  }, [output]);

  useEffect(() => {
    if (mode === 'compress' || inputMode === 'serial') {
      autoFocusInput(compressDecompressElementRef?.current);
      return;
    }
    autoFocusInput(leftInputElementRef?.current);
  }, [mode, inputMode]);

  const memoizedHandleKeyPress = useCallback(handleKeyPress, [handleKeyPress]);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Compresor/Descompresor de Matriz</CardTitle>
        </CardHeader>
        <CardContent>
          <SwitchWithLabel
            checked={mode === 'decompress'}
            label={`Modo: ${mode === 'compress' ? 'Comprimir' : 'Descomprimir'}`}
            onCheckedChange={(checked: boolean) =>
              setMode(checked ? 'decompress' : 'compress')
            }
          />
          {mode === 'decompress' && (
            <SwitchWithLabel
              checked={inputMode === 'parallel'}
              label={`Modo de entrada: ${inputMode === 'serial' ? 'Serial' : 'Paralelo'}`}
              onCheckedChange={inputModeToggle}
            />
          )}
          {mode === 'decompress' && inputMode === 'parallel' ? (
            <div className="flex space-x-2 mb-4">
              <CustomTextArea
                placeholder="Parte inicial presione las teclas de la izquierda."
                value={parallelInput[0]}
                id="left"
                onChange={handleInputChange}
                onKeyPress={memoizedHandleKeyPress}
                className="w-1/2"
                ref={leftInputElementRef}
              />
              <CustomTextArea
                placeholder="Parte final, presione las teclas de la derecha"
                id="right"
                value={parallelInput[1]}
                onChange={handleInputChange}
                onKeyPress={memoizedHandleKeyPress}
                className="w-1/2"
                ref={rightInputElementRef}
              />
            </div>
          ) : (
            <CustomTextArea
              placeholder={
                mode === 'compress'
                  ? 'Ingrese el texto a comprimir'
                  : 'Ingrese el texto codificado a descomprimir'
              }
              value={input}
              onChange={handleInputChange}
              onKeyPress={memoizedHandleKeyPress}
              ref={compressDecompressElementRef}
            />
          )}
          <Button onClick={handleReset}>Reset</Button>
          {mode === 'decompress' &&
            leftInputElementRef &&
            rightInputElementRef && (
              <KeyBoardPressViewer
                parallelMode={mode === 'decompress' && inputMode === 'parallel'}
                compressDecompressElementRef={compressDecompressElementRef}
                handleKeyPress={memoizedHandleKeyPress}
                leftInputElementRef={leftInputElementRef}
                rightInputElementRef={rightInputElementRef}
              />
            )}
          <MatrixVisualization mode={mode} input={input} output={output} />
          <br />
          <CopyableOutput
            title="CodeBook Arduino"
            content={letterCodebookOutput}
            onCopy={(text) =>
              handleCopy(text, 'CodeBook para el Arduino copiado')
            }
          />
          <CopyableOutput
            title="CODEBOOK Descompresor"
            content={output}
            onCopy={(text) =>
              handleCopy(text, 'CoodeBook para el descompresor copiado')
            }
          />
          <div className="mb-4">
            <p>Caracteres antes: {charCount.before}</p>
            <p>Caracteres después: {charCount.after}</p>
          </div>
          <CodebookDisplay />
        </CardContent>
      </Card>

      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copiado al portapapeles</DialogTitle>
            <DialogDescription>{copyMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
