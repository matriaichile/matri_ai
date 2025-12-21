'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './WizardInput.module.css';

interface WizardInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

/**
 * Input elegante para el wizard.
 */
const WizardInput = forwardRef<HTMLInputElement, WizardInputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className={styles.inputGroup}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputWrapper}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <input
            ref={ref}
            className={`${styles.input} ${icon ? styles.inputWithIcon : ''} ${
              error ? styles.inputError : ''
            } ${className || ''}`}
            {...props}
          />
        </div>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  }
);

WizardInput.displayName = 'WizardInput';

export default WizardInput;










