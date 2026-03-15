import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const formatted = parseInt(digits, 10).toLocaleString('en-US');
  return `${formatted} UZS`;
}
