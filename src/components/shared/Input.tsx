'use client';

import React from 'react';

import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  glow?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  glow = false,
  className,
  ...props
}) => {
  const inputClasses = cn(
    'input',
    glow && 'glow-hover',
    error && 'border-spiler-error focus:border-spiler-error',
    icon && 'pl-12',
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-spiler-text">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-spiler-text-muted">
            {icon}
          </div>
        )}
        <input
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-spiler-error animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  glow?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  glow = false,
  className,
  ...props
}) => {
  const textareaClasses = cn(
    'input min-h-[100px] resize-y',
    glow && 'glow-hover',
    error && 'border-spiler-error focus:border-spiler-error',
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-spiler-text">
          {label}
        </label>
      )}
      <textarea
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-spiler-error animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  glow?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  glow = false,
  className,
  ...props
}) => {
  const selectClasses = cn(
    'input cursor-pointer',
    glow && 'glow-hover',
    error && 'border-spiler-error focus:border-spiler-error',
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-spiler-text">
          {label}
        </label>
      )}
      <select
        className={selectClasses}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-spiler-dark">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-spiler-error animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
