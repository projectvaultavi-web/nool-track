'use client';

import React, { SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  isFullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      label,
      error,
      isFullWidth = true,
      disabled,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const defaultId = React.useId();
    const selectId = id || defaultId;
    
    const wrapperClasses = [
      styles.wrapper,
      isFullWidth ? styles.fullWidth : '',
      className,
    ].filter(Boolean).join(' ');

    const selectClasses = [
      styles.select,
      error ? styles.hasError : '',
      disabled ? styles.disabled : '',
    ].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label} {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={styles.selectContainer}>
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {children}
          </select>
          <div className={styles.iconWrapper}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.41 0.589966L6 5.16997L10.59 0.589966L12 1.99997L6 7.99997L0 1.99997L1.41 0.589966Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        {error && (
          <p id={`${selectId}-error`} className={styles.errorText}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
