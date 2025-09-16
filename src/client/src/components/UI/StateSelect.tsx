import React from 'react';
import { ESTADOS_BRASILEIROS } from '../../data/estadosBrasileiros';

interface StateSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export function StateSelect({ 
  label, 
  value, 
  onChange, 
  placeholder = "Selecione o estado", 
  disabled = false,
  required = false,
  error
}: StateSelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`input ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
      >
        <option value="">{placeholder}</option>
        {ESTADOS_BRASILEIROS.map((estado) => (
          <option key={estado.sigla} value={estado.sigla}>
            {estado.nome} ({estado.sigla})
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
