'use client';

import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { ProcessType } from '@prisma/client';
import styles from './ContractorFilters.module.css';

interface ContractorFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  type: string;
  onTypeChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
}

const PROCESS_TYPES = Object.values(ProcessType);

export function ContractorFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  status,
  onStatusChange,
}: ContractorFiltersProps) {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.searchWrap}>
        <SearchInput
          placeholder="Search contractors..."
          value={search}
          onSearch={onSearchChange}
        />
      </div>
      
      <div className={styles.selectWrap}>
        <Select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          aria-label="Filter by Type"
        >
          <option value="">All Types</option>
          {PROCESS_TYPES.map((pt) => (
            <option key={pt} value={pt}>
              {pt}
            </option>
          ))}
        </Select>

        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by Status"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>
    </div>
  );
}
