'use client';

import React from 'react';

import { cn } from '../../lib/utils';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showLabel?: boolean;
  pulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  label,
  showLabel = false,
  pulse = true,
}) => {
  const statusClasses = {
    online: 'status-online bg-green-400',
    offline: 'status-offline bg-red-400',
    busy: 'status-busy bg-yellow-400',
    away: 'bg-gray-400',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    busy: 'Busy',
    away: 'Away',
  };

  const displayLabel = label || statusLabels[status];

  return (
    <div className="flex items-center space-x-2">
      <div
        className={cn(
          'rounded-full',
          statusClasses[status],
          sizes[size],
          pulse && status === 'online' && 'animate-pulse'
        )}
      />
      {showLabel && (
        <span className="text-sm text-spiler-text-muted">
          {displayLabel}
        </span>
      )}
    </div>
  );
};

interface CallStatusProps {
  status: 'idle' | 'dialing' | 'connected' | 'on-hold' | 'ended';
  duration?: string;
}

export const CallStatus: React.FC<CallStatusProps> = ({ status, duration }) => {
  const statusConfig = {
    idle: { color: 'bg-gray-400', label: 'Idle', pulse: false },
    dialing: { color: 'bg-yellow-400', label: 'Dialing...', pulse: true },
    connected: { color: 'bg-green-400', label: 'Connected', pulse: true },
    'on-hold': { color: 'bg-orange-400', label: 'On Hold', pulse: true },
    ended: { color: 'bg-red-400', label: 'Call Ended', pulse: false },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-spiler-light border border-spiler-border">
      <div
        className={cn(
          'w-3 h-3 rounded-full',
          config.color,
          config.pulse && 'animate-pulse'
        )}
      />
      <div className="flex-1">
        <span className="text-sm font-medium text-spiler-text">
          {config.label}
        </span>
        {duration && (
          <div className="text-xs text-spiler-text-muted">
            {duration}
          </div>
        )}
      </div>
    </div>
  );
};
