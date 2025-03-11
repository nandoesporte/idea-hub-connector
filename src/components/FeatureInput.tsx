
import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FeatureInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: (feature: string) => void;
}

const FeatureInput = ({ value, onChange, onAdd }: FeatureInputProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      onAdd(value);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        name="features"
        value={value}
        onChange={onChange}
        placeholder="Ex: Integração com Instagram, Chat ao vivo, etc."
        onKeyDown={handleKeyDown}
        className="transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => value.trim() && onAdd(value)}
        disabled={!value.trim()}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FeatureInput;
