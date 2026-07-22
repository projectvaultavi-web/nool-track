import Papa from 'papaparse';

export function generateCSV<T extends Record<string, unknown>>(
  data: T[]
): string {
  const csv = Papa.unparse(data);
  // Add BOM for Excel compatibility
  return '\ufeff' + csv;
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
