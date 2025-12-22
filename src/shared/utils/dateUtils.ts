import { format, parse, isValid, startOfDay, endOfDay, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { DateValidation } from '../../types';

/**
 * Formats a date to YYYY-MM-DD string
 */
export function formatDateToString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Gets current date in YYYY-MM-DD format
 */
export function getCurrentDateString(): string {
  return formatDateToString(new Date());
}

/**
 * Parses and validates a date string in YYYY-MM-DD format
 */
export function validateAndParseDate(dateString: string): DateValidation {
  try {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    
    if (!isValid(parsedDate)) {
      return { isValidDate: false };
    }
    
    // Ensure the date string matches the parsed date to prevent invalid dates like 2023-02-30
    const formattedDate = formatDateToString(parsedDate);
    if (formattedDate !== dateString) {
      return { isValidDate: false };
    }
    
    return {
      isValidDate: true,
      parsedDate: startOfDay(parsedDate),
      formattedDate: dateString
    };
  } catch (error) {
    return { isValidDate: false };
  }
}

/**
 * Gets the start and end of the current month
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now)
  };
}

/**
 * Gets the start and end of a specific month and year
 */
export function getMonthRange(year: number, month: number): { start: Date; end: Date; totalDays: number } {
  const date = new Date(year, month - 1); // month is 0-indexed
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
    totalDays: getDaysInMonth(date)
  };
}

/**
 * Gets current month and year
 */
export function getCurrentMonthYear(): { month: number; year: number; monthString: string } {
  const now = new Date();
  const month = now.getMonth() + 1; // Convert to 1-indexed
  const year = now.getFullYear();
  const monthString = format(now, 'yyyy-MM');
  
  return { month, year, monthString };
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date): boolean {
  const today = startOfDay(new Date());
  const checkDate = startOfDay(date);
  return today.getTime() === checkDate.getTime();
}

/**
 * Checks if a date is in the past
 */
export function isPastDate(date: Date): boolean {
  const today = startOfDay(new Date());
  const checkDate = startOfDay(date);
  return checkDate.getTime() < today.getTime();
}

/**
 * Checks if a date is in the future
 */
export function isFutureDate(date: Date): boolean {
  const today = startOfDay(new Date());
  const checkDate = startOfDay(date);
  return checkDate.getTime() > today.getTime();
}