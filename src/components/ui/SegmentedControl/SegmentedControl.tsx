'use client';

import React from 'react';
import styles from './SegmentedControl.module.css';

export interface SegmentedControlItem {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  items: SegmentedControlItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  items,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {items.map((item) => (
        <button
          key={item.value}
          className={`${styles.segment} ${value === item.value ? styles.active : ''}`}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
