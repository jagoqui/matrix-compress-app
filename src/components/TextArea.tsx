import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface TextAreaProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ placeholder, value, onChange, onKeyPress, className }) => (
  <Textarea
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onKeyPress={onKeyPress}
    className={className || "mb-4 font-mono text-lg h-40"}
  />
);
