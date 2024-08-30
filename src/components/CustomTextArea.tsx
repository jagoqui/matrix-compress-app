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
  ({ placeholder, value, onChange, onKeyPress, className, id }, ref) => (
    <Textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange} // Pass the event directly
      onKeyPress={onKeyPress}
      id={id}
      className={className || 'mb-4 font-mono text-lg h-80'}
      ref={ref} // Pass ref to the inner Textarea component
    />
  ),
);

CustomTextArea.displayName = 'CustomTextarea';

export { CustomTextArea };
