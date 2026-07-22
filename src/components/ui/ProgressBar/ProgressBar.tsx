'use client';

import React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'primary',
}) => {
  const boundedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={styles.container}>
      <div
        className={`${styles.fill} ${styles[`variant-${variant}`]}`}
        style={{ width: `${boundedProgress}%` }}
      />
    </div>
  );
};
