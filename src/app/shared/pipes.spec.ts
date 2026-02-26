import { describe, expect, test } from 'bun:test';
import { CurrencyPipe, FilterByPipe, SortByPipe, TitleCasePipe, TruncatePipe } from './pipes';

describe('CurrencyPipe', () => {
  const pipe = new CurrencyPipe();

  describe('transform', () => {
    test('should format number with default currency and decimals', () => {
      expect(pipe.transform(1234.5)).toBe('$1234.50');
    });

    test('should format number with custom currency', () => {
      expect(pipe.transform(1234.5, '€')).toBe('€1234.50');
      expect(pipe.transform(1234.5, '£')).toBe('£1234.50');
      expect(pipe.transform(1234.5, '¥')).toBe('¥1234.50');
    });

    test('should format with custom decimal places', () => {
      expect(pipe.transform(1234.5, '$', 0)).toBe('$1235');
      expect(pipe.transform(1234.5, '$', 1)).toBe('$1234.5');
      expect(pipe.transform(1234.5, '$', 3)).toBe('$1234.500');
    });

    test('should handle string numbers', () => {
      expect(pipe.transform('1234.5')).toBe('$1234.50');
      expect(pipe.transform('99.99', '€')).toBe('€99.99');
    });

    test('should return empty string for null', () => {
      expect(pipe.transform(null as any)).toBe('');
    });

    test('should return empty string for undefined', () => {
      expect(pipe.transform(undefined as any)).toBe('');
    });

    test('should return empty string for empty string', () => {
      expect(pipe.transform('')).toBe('');
    });

    test('should return empty string for NaN', () => {
      expect(pipe.transform('not a number')).toBe('');
    });

    test('should handle negative numbers', () => {
      expect(pipe.transform(-1234.5)).toBe('$-1234.50');
    });

    test('should handle zero', () => {
      expect(pipe.transform(0)).toBe('$0.00');
    });

    test('should handle large numbers', () => {
      expect(pipe.transform(1234567.89)).toBe('$1234567.89');
    });
  });
});

describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  describe('transform', () => {
    test('should truncate text longer than limit', () => {
      const text = 'This is a long text that should be truncated';
      expect(pipe.transform(text, 20)).toBe('This is a long te...');
    });

    test('should not truncate text shorter than limit', () => {
      const text = 'Short text';
      expect(pipe.transform(text, 50)).toBe('Short text');
    });

    test('should not truncate text equal to limit', () => {
      const text = 'Exactly 10';
      expect(pipe.transform(text, 10)).toBe('Exactly 10');
    });

    test('should use custom suffix', () => {
      const text = 'This is a long text';
      // limit 10, suffix ' [more]' is 7 chars, so content should be 3 chars
      expect(pipe.transform(text, 10, ' [more]')).toBe('Thi [more]');
    });

    test('should use default limit of 50', () => {
      const shortText = 'A'.repeat(50);
      expect(pipe.transform(shortText)).toBe(shortText);

      const longText = 'A'.repeat(51);
      expect(pipe.transform(longText).length).toBeLessThan(51);
    });

    test('should return empty string for null', () => {
      expect(pipe.transform(null as any)).toBe('');
    });

    test('should return empty string for undefined', () => {
      expect(pipe.transform(undefined as any)).toBe('');
    });

    test('should handle empty string', () => {
      expect(pipe.transform('')).toBe('');
    });

    test('should account for suffix length in truncation', () => {
      const text = '123456789012345';
      // limit 10, suffix '...' is 3 chars, so content should be 7 chars
      expect(pipe.transform(text, 10)).toBe('1234567...');
    });
  });
});

describe('FilterByPipe', () => {
  const pipe = new FilterByPipe();

  interface TestItem {
    name: string;
    category: string;
    value?: number;
  }

  const items: TestItem[] = [
    { name: 'Apple', category: 'Fruit' },
    { name: 'Banana', category: 'Fruit' },
    { name: 'Carrot', category: 'Vegetable' },
    { name: 'Broccoli', category: 'Vegetable' },
  ];

  describe('transform', () => {
    test('should filter by property value (case insensitive)', () => {
      const result = pipe.transform(items, 'category', 'fruit');
      expect(result.length).toBe(2);
      expect(result.every((i) => i.category === 'Fruit')).toBe(true);
    });

    test('should filter with partial match', () => {
      const result = pipe.transform(items, 'name', 'an');
      expect(result.length).toBe(1); // Only Banana contains 'an'
      expect(result.map((i) => i.name)).toEqual(['Banana']);
    });

    test('should return all items when search is empty', () => {
      const result = pipe.transform(items, 'name', '');
      expect(result).toEqual(items);
    });

    test('should return empty array for null items', () => {
      expect(pipe.transform(null as any, 'name', 'test')).toEqual([]);
    });

    test('should return empty array for undefined items', () => {
      expect(pipe.transform(undefined as any, 'name', 'test')).toEqual([]);
    });

    test('should return empty array for non-array items', () => {
      expect(pipe.transform({} as any, 'name', 'test')).toEqual([]);
    });

    test('should return empty array when no matches', () => {
      const result = pipe.transform(items, 'name', 'xyz');
      expect(result).toEqual([]);
    });

    test('should handle items with null property values', () => {
      const itemsWithNull: TestItem[] = [
        { name: 'Apple', category: 'Fruit' },
        { name: 'Test', category: 'Fruit', value: null as any },
      ];
      const result = pipe.transform(itemsWithNull, 'value', 'test');
      expect(result).toEqual([]);
    });

    test('should filter by different properties', () => {
      const result = pipe.transform(items, 'name', 'apple');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Apple');
    });
  });
});

describe('SortByPipe', () => {
  const pipe = new SortByPipe();

  interface TestItem {
    name: string;
    value: number;
  }

  const items: TestItem[] = [
    { name: 'Apple', value: 3 },
    { name: 'Banana', value: 1 },
    { name: 'Cherry', value: 2 },
  ];

  describe('transform', () => {
    test('should sort in ascending order', () => {
      const result = pipe.transform(items, 'value', 'asc');
      expect(result.map((i) => i.value)).toEqual([1, 2, 3]);
    });

    test('should sort in descending order', () => {
      const result = pipe.transform(items, 'value', 'desc');
      expect(result.map((i) => i.value)).toEqual([3, 2, 1]);
    });

    test('should use ascending as default direction', () => {
      const result = pipe.transform(items, 'value');
      expect(result.map((i) => i.value)).toEqual([1, 2, 3]);
    });

    test('should sort strings alphabetically', () => {
      const result = pipe.transform(items, 'name', 'asc');
      expect(result.map((i) => i.name)).toEqual(['Apple', 'Banana', 'Cherry']);
    });

    test('should not mutate original array', () => {
      const original = [...items];
      pipe.transform(items, 'value', 'desc');
      expect(items).toEqual(original);
    });

    test('should return empty array for null items', () => {
      expect(pipe.transform(null as any, 'value')).toEqual([]);
    });

    test('should return empty array for undefined items', () => {
      expect(pipe.transform(undefined as any, 'value')).toEqual([]);
    });

    test('should return empty array for non-array items', () => {
      expect(pipe.transform({} as any, 'value')).toEqual([]);
    });

    test('should handle empty array', () => {
      expect(pipe.transform([], 'value')).toEqual([]);
    });

    test('should handle single item array', () => {
      const single = [{ name: 'Only', value: 1 }];
      const result = pipe.transform(single, 'value');
      expect(result).toEqual(single);
    });
  });
});

describe('TitleCasePipe', () => {
  const pipe = new TitleCasePipe();

  describe('transform', () => {
    test('should convert lowercase to title case', () => {
      expect(pipe.transform('hello world')).toBe('Hello World');
    });

    test('should convert uppercase to title case', () => {
      expect(pipe.transform('HELLO WORLD')).toBe('Hello World');
    });

    test('should handle mixed case', () => {
      expect(pipe.transform('hELLo WoRLd')).toBe('Hello World');
    });

    test('should handle single word', () => {
      expect(pipe.transform('hello')).toBe('Hello');
    });

    test('should handle multiple spaces', () => {
      expect(pipe.transform('hello  world')).toBe('Hello  World');
    });

    test('should return empty string for null', () => {
      expect(pipe.transform(null as any)).toBe('');
    });

    test('should return empty string for undefined', () => {
      expect(pipe.transform(undefined as any)).toBe('');
    });

    test('should return empty string for empty string', () => {
      expect(pipe.transform('')).toBe('');
    });

    test('should handle sentence with many words', () => {
      expect(pipe.transform('the quick brown fox jumps over the lazy dog')).toBe(
        'The Quick Brown Fox Jumps Over The Lazy Dog'
      );
    });
  });
});
