'use client';

import React from 'react';

import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glass?: boolean;
  loading?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  glass = false,
  loading = false,
}) => {
  const baseClasses = 'card';
  const hoverClasses = hover ? 'hover:transform hover:-translate-y-1 hover:shadow-spiler-lg hover:border-spiler-primary' : '';
  const glowClasses = glow ? 'shadow-glow' : '';
  const glassClasses = glass ? 'glass' : '';
  const loadingClasses = loading ? 'loading' : '';
  
  return (
    <div
      className={cn(
        baseClasses,
        hoverClasses,
        glowClasses,
        glassClasses,
        loadingClasses,
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={cn('mb-4 pb-4 border-b border-spiler-border', className)}>
    {children}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className, gradient = false }) => (
  <h3 className={cn(
    'text-xl font-bold',
    gradient ? 'gradient-text' : 'text-spiler-text',
    className
  )}>
    {children}
  </h3>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn('text-spiler-text-muted', className)}>
    {children}
  </div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={cn('mt-4 pt-4 border-t border-spiler-border flex justify-end space-x-2', className)}>
    {children}
  </div>
);
