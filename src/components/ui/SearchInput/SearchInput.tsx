'use client';

import React, { useState, useEffect, InputHTMLAttributes } from 'react';
import styles from './SearchInput.module.css';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch: (value: string) => void;
  debounceMs?: number;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = '', onSearch, debounceMs = 300, ...props }, ref) => {
    const [value, setValue] = useState(props.defaultValue?.toString() || '');

    useEffect(() => {
      const timer = setTimeout(() => {
        onSearch(value);
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [value, debounceMs, onSearch]);

    return (
      <div className={`${styles.wrapper} ${className}`}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
        </svg>
        <input
          ref={ref}
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          {...props}
        />
        {value && (
          <button className={styles.clearBtn} onClick={() => setValue('')} type="button">
            &times;
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
