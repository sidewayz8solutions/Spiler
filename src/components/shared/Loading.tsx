'use client';

import React from 'react';

import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'secondary';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colors = {
    primary: 'border-spiler-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    secondary: 'border-spiler-secondary border-t-transparent',
  };

  return (
    <div
      className={cn(
        'border-2 rounded-full animate-spin',
        sizes[size],
        colors[color]
      )}
    />
  );
};

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-spiler-primary rounded-full animate-pulse',
            sizes[size]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

interface LoadingBarProps {
  progress?: number;
  indeterminate?: boolean;
  className?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({
  progress = 0,
  indeterminate = false,
  className,
}) => {
  return (
    <div className={cn('w-full bg-spiler-dark rounded-full h-2', className)}>
      <div
        className={cn(
          'h-2 rounded-full bg-gradient-to-r from-spiler-primary to-spiler-secondary transition-all duration-300',
          indeterminate && 'loading'
        )}
        style={{
          width: indeterminate ? '100%' : `${Math.min(100, Math.max(0, progress))}%`,
        }}
      />
    </div>
  );
};

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  message = 'Loading...',
}) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="lg" color="white" />
            <p className="mt-4 text-white font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, lines = 1 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-spiler-light rounded animate-pulse',
            lines === 1 ? 'h-4' : i === lines - 1 ? 'h-4 w-3/4' : 'h-4',
            className
          )}
        />
      ))}
    </div>
  );
};
