import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?:    'sm' | 'md';
}

const variants = {
  default: 'dark:bg-surface-hover dark:text-ink-secondary bg-gray-100 text-gray-600',
  success: 'bg-brand/15 text-brand',
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
