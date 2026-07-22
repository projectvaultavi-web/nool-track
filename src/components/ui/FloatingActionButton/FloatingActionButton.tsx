'use client';

import React, { ButtonHTMLAttributes } from 'react';
import styles from './FloatingActionButton.module.css';

export interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
}

export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className = '', icon, label, ...props }, ref) => {
    return (
      <button ref={ref} className={`${styles.fab} ${className}`} {...props}>
        <span className={styles.icon}>{icon}</span>
        {label && <span className={styles.label}>{label}</span>}
      </button>
    );
  }
);
FloatingActionButton.displayName = 'FloatingActionButton';
