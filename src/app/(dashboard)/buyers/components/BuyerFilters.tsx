'use client';

import React from 'react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import styles from './BuyerFilters.module.css';

interface BuyerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function BuyerFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: BuyerFiltersProps) {
  return (
    <div className={styles.filters}>
      <div className={styles.searchWrap}>
        <SearchInput
          placeholder="Search buyers..."
          value={search}
          onSearch={onSearchChange}
        />
      </div>
      
      <div className={styles.filterWrap}>
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>
    </div>
  );
}
