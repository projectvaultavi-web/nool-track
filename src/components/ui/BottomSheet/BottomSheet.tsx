'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './BottomSheet.module.css';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  if (isOpen && !isRendered) {
    setIsRendered(true);
  }

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow DOM to render before adding visible class for animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      document.body.style.overflow = 'hidden';
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        document.body.style.overflow = 'unset';
      }, 300); // match transition time
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const content = (
    <>
      <div 
        className={`${styles.overlay} ${isVisible ? styles.visible : ''}`} 
        onClick={onClose} 
      />
      <div 
        className={`${styles.sheet} ${isVisible ? styles.visible : ''}`}
        role="dialog"
      >
        <div className={styles.header}>
          <div className={styles.dragHandle} onClick={onClose} />
          {title && <h2 className={styles.title}>{title}</h2>}
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return null;
};
