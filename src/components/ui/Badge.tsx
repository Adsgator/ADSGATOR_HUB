import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?:    'sm' | 'md';
}

const variants = {
  default: 'bg-surface-hover text-ink-secondary',
  success: 'bg-ads-500/15 text-ads-500',
  warning: 'bg-status-orange/15 text-status-orange',
  danger:  'bg-status-red/15 text-status-red',
  info:    'bg-status-blue/15 text-status-blue',
  purple:  'bg-status-purple/15 text-status-purple',
};

const sizes = {
  sm: 'text-2xs px-[0.375rem] py-[0.0625rem] rounded-[0.1875rem]',
  md: 'text-xs  px-[0.5rem]  py-[0.125rem]  rounded-[0.25rem]',
};

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-semibold ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
