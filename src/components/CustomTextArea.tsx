import React, { forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface CustomTextAreaProps {
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyPress?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  id?: string;
  className?: string;
}

const CustomTextArea = forwardRef<HTMLTextAreaElement, CustomTextAreaProps>(
  (
    { placeholder, value, onChange, onKeyPress, className, id, ...props },
    ref,
  ) => (
    <Textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress} // Changed from onKeyPress to onKeyDown
      id={id}
      className={className || 'mb-4 font-mono text-lg h-80'}
      ref={ref}
      {...props}
    />
  ),
);

CustomTextArea.displayName = 'CustomTextarea';

export { CustomTextArea };
