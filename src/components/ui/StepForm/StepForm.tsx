'use client';

import React from 'react';
import styles from './StepForm.module.css';
import { Button } from '../Button';

export interface Step {
  title: string;
  content: React.ReactNode;
}

export interface StepFormProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isNextDisabled?: boolean;
}

export const StepForm: React.FC<StepFormProps> = ({
  steps,
  currentStep,
  onNext,
  onBack,
  onSubmit,
  isNextDisabled = false,
}) => {
  const isLastStep = currentStep === steps.length - 1;
  const stepData = steps[currentStep];

  if (!stepData) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.indicators}>
        {steps.map((step, index) => (
          <div key={index} className={styles.stepIndicator}>
            <div
              className={`${styles.circle} ${
                index === currentStep ? styles.active : index < currentStep ? styles.completed : ''
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && <div className={styles.line} />}
          </div>
        ))}
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.stepTitle}>{stepData.title}</h3>
        {stepData.content}
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onBack} disabled={currentStep === 0}>
          Back
        </Button>
        {isLastStep ? (
          <Button onClick={onSubmit} disabled={isNextDisabled}>
            Submit
          </Button>
        ) : (
          <Button onClick={onNext} disabled={isNextDisabled}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};
