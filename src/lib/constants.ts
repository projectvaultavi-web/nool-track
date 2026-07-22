export const PROCESS_TYPES = [
  { value: 'CUTTING', label: 'Cutting' },
  { value: 'DYEING', label: 'Dyeing' },
  { value: 'PRINTING', label: 'Printing' },
  { value: 'EMBROIDERY', label: 'Embroidery' },
  { value: 'STITCHING', label: 'Stitching' },
  { value: 'WASHING', label: 'Washing' },
  { value: 'FINISHING', label: 'Finishing' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const JOB_UNITS = [
  { value: 'METERS', label: 'Meters' },
  { value: 'PIECES', label: 'Pieces' },
  { value: 'KILOGRAMS', label: 'Kilograms' },
  { value: 'YARDS', label: 'Yards' },
  { value: 'SETS', label: 'Sets' },
] as const;

export const JOB_STATUSES = [
  { value: 'SENT', label: 'Sent', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'yellow' },
  { value: 'PARTIALLY_RETURNED', label: 'Partially Returned', color: 'orange' },
  { value: 'COMPLETED', label: 'Completed', color: 'green' },
  { value: 'CLOSED', label: 'Closed', color: 'gray' },
] as const;

export const PRODUCTION_ORDER_STATUSES = [
  { value: 'CREATED', label: 'Created', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'yellow' },
  { value: 'COMPLETED', label: 'Completed', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'gray' },
] as const;

export const QUALITY_GRADES = [
  { value: 'A', label: 'A Grade', description: 'Perfect quality' },
  { value: 'B', label: 'B Grade', description: 'Minor defects' },
  { value: 'C', label: 'C Grade', description: 'Major defects' },
  { value: 'REJECTED', label: 'Rejected', description: 'Unusable' },
] as const;

export const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CHEQUE', label: 'Cheque' },
] as const;

export const DEFAULT_WASTAGE_THRESHOLDS: Record<string, number> = {
  CUTTING: 2.0,
  DYEING: 3.0,
  PRINTING: 2.0,
  EMBROIDERY: 1.5,
  STITCHING: 2.0,
  WASHING: 2.5,
  FINISHING: 1.0,
  OTHER: 2.0,
};

export const ITEMS_PER_PAGE = 25;

export const APP_NAME = 'Nool Track';
export const APP_DESCRIPTION = 'The operating system for textile job-work management';
