import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: string): string {
  if (!value) return '';
  const cleanStr = value.replace(/[^\d.]/g, '');
  if (!cleanStr) return value;
  
  const num = parseFloat(cleanStr);
  if (isNaN(num)) return value;
  
  return `${num} UZS`;
}

export function parsePrice(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleanStr = String(value).replace(/[^\d.-]/g, '');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
}

export function calculateGroupBalance(student: any, groupName: string): number {
  return student.groupBalances?.[groupName] || 0;
}

export function getGroupPrice(studentGroups: string, studentPrices: string, groupName: string): string {
  const groups = studentGroups ? studentGroups.split(/,\s+/) : [];
  const prices = studentPrices ? studentPrices.split(/,\s+/) : [];
  const groupIndex = groups.indexOf(groupName);
  if (groupIndex === -1) return '';
  return prices[groupIndex] || '';
}

export function getGroupRegistrationDate(studentGroups: string, studentRegistrations: string, groupName: string): string {
  const groups = studentGroups ? studentGroups.split(/,\s+/) : [];
  const registrations = studentRegistrations ? studentRegistrations.split(/,\s+/) : [];
  const groupIndex = groups.indexOf(groupName);
  if (groupIndex === -1) return '';
  return registrations[groupIndex] || '';
}

export function displayPrice(value: string | number): string {
  if (value === undefined || value === null) return '';
  const strValue = String(value);
  
  // Handle comma-separated lists (e.g., multiple courses)
  if (strValue.includes(',')) {
    return strValue.split(',').map(part => {
      const cleanStr = part.replace(/[^\d.-]/g, '');
      if (!cleanStr) return part.trim();
      const num = parseFloat(cleanStr);
      if (isNaN(num)) return part.trim();
      return `${num.toLocaleString('en-US')} UZS`;
    }).join(', ');
  }

  const cleanStr = strValue.replace(/[^\d.-]/g, '');
  if (!cleanStr) return strValue;
  
  const num = parseFloat(cleanStr);
  if (isNaN(num)) return strValue;
  
  return `${num.toLocaleString('en-US')} UZS`;
}
