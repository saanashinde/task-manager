import React from 'react';
/**
 * FilterControls component for switching between task filters (all, completed, incomplete).
 */
import type { FilterStatus } from '../../types';
import styles from './FilterControls.module.css';

interface FilterControlsProps {
  currentFilter: FilterStatus;
  onSetFilter: (filter: FilterStatus) => void;
}

const FILTERS: { label: string; value: FilterStatus; icon: string }[] = [
  { label: 'All', value: 'all', icon: '📋' },
  { label: 'Completed', value: 'completed', icon: '✅' },
  { label: 'Incomplete', value: 'incomplete', icon: '🕗' },
];

const FilterControls = ({ currentFilter, onSetFilter }: FilterControlsProps) => {
  return (
    <div className={styles.filterControls} role="group" aria-label="Task filter controls">
      {FILTERS.map(({ label, value, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onSetFilter(value)}
          className={`${styles.filterButton} ${currentFilter === value ? styles.active : ''}`}
          aria-pressed={currentFilter === value}
          aria-label={label}
        >
          <span className={styles.icon} aria-hidden="true">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
};

export default React.memo(FilterControls);