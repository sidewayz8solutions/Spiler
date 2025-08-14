'use client';

import React from 'react';

import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  glow = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseClasses = 'btn relative overflow-hidden font-semibold transition-all duration-300 transform hover:scale-105 focus:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-spiler-primary to-spiler-secondary text-white shadow-glow hover:shadow-glow-lg',
    secondary: 'btn-secondary text-spiler-text hover:text-white',
    success: 'btn-success text-white',
    danger: 'btn-danger text-white',
    ghost: 'bg-transparent border border-spiler-border text-spiler-text hover:bg-spiler-light hover:border-spiler-primary'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl'
  };
  
  const glowClass = glow ? 'pulse-glow' : '';
  
  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        glowClass,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};
