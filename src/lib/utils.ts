import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: string): string {
  if (!value) return '';
  // Remove all non-digit and non-period characters, except if we want to keep spaces?
  // Better: remove spaces, commas, UZS, etc.
  const cleanStr = value.replace(/[^\d.]/g, '');
  if (!cleanStr) return value;
  
  const num = parseFloat(cleanStr);
  if (isNaN(num)) return value;
  
  const formatted = num.toLocaleString('en-US');
  return `${formatted} UZS`;
}
