'use client';

import React from 'react';
import styles from './StatCard.module.css';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subtleColor?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  subtleColor = false,
}) => {
  return (
    <div className={`${styles.card} ${subtleColor ? styles.subtle : ''}`}>
      <div className={styles.content}>
        <div className={styles.info}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
        </div>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>
    </div>
  );
};
