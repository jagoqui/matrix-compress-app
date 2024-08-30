import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SwitchWithLabelProps {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

export const SwitchWithLabel: React.FC<SwitchWithLabelProps> = ({
  checked,
  label,
  onCheckedChange,
}) => (
  <div className="flex items-center space-x-2 mb-4">
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
    <Label>{label}</Label>
  </div>
);
