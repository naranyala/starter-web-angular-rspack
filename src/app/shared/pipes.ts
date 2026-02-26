import { Pipe, type PipeTransform } from '@angular/core';

/**
 * Format a number as currency
 */
@Pipe({
  name: 'currency',
  standalone: true,
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number | string, currency: string = '$', decimals: number = 2): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (Number.isNaN(num)) {
      return '';
    }

    return `${currency}${num.toFixed(decimals)}`;
  }
}

/**
 * Truncate text to a specified length
 */
@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50, suffix: string = '...'): string {
    if (!value) {
      return '';
    }

    if (value.length <= limit) {
      return value;
    }

    return value.substring(0, limit - suffix.length) + suffix;
  }
}

/**
 * Filter an array by a property value
 */
@Pipe({
  name: 'filterBy',
  standalone: true,
})
export class FilterByPipe implements PipeTransform {
  transform<T extends Record<string, any>>(
    items: T[],
    property: keyof T,
    searchValue: string
  ): T[] {
    if (!items || !Array.isArray(items)) {
      return [];
    }

    if (!searchValue) {
      return items;
    }

    const searchLower = searchValue.toLowerCase();
    return items.filter((item) => {
      const value = item[property];
      if (value === null || value === undefined) {
        return false;
      }
      return String(value).toLowerCase().includes(searchLower);
    });
  }
}

/**
 * Sort an array by a property
 */
@Pipe({
  name: 'sortBy',
  standalone: true,
})
export class SortByPipe implements PipeTransform {
  transform<T extends Record<string, any>>(
    items: T[],
    property: keyof T,
    direction: 'asc' | 'desc' = 'asc'
  ): T[] {
    if (!items || !Array.isArray(items)) {
      return [];
    }

    return [...items].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];

      if (aVal === bVal) {
        return 0;
      }

      const comparison = aVal < bVal ? -1 : 1;
      return direction === 'asc' ? comparison : -comparison;
    });
  }
}

/**
 * Convert string to title case
 */
@Pipe({
  name: 'titleCase',
  standalone: true,
})
export class TitleCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    return value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
