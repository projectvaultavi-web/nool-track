'use client';

import React, { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isFullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      helperText,
      isFullWidth = true,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const defaultId = React.useId();
    const inputId = id || defaultId;
    
    const wrapperClasses = [
      styles.wrapper,
      isFullWidth ? styles.fullWidth : '',
      className,
    ].filter(Boolean).join(' ');

    const inputClasses = [
      styles.input,
      error ? styles.hasError : '',
      disabled ? styles.disabled : '',
    ].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label} {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className={styles.errorText}>
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
