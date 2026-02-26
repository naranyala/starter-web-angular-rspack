/**
 * Async and Observable Testing Examples
 *
 * Demonstrates testing patterns for async operations,
 * Observables, Promises, and Signals with Bun test.
 */

import { beforeEach, describe, expect, test } from 'bun:test';
import { computed, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

// Sample async service for testing
@Injectable({ providedIn: 'root' })
class AsyncDataService {
  async getData(): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(['item1', 'item2', 'item3']), 100);
    });
  }

  async getError(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Async error')), 100);
    });
  }

  getObservable(): Observable<number[]> {
    return of([1, 2, 3]);
  }

  getErrorObservable(): Observable<never> {
    return new Observable((observer) => {
      observer.error(new Error('Observable error'));
    });
  }
}

// Sample service using Signals
@Injectable({ providedIn: 'root' })
class SignalCounterService {
  private count = signal(0);
  readonly value = this.count.asReadonly();
  readonly doubled = computed(() => this.count() * 2);
  readonly isEven = computed(() => this.count() % 2 === 0);

  increment(): void {
    this.count.update((c) => c + 1);
  }

  decrement(): void {
    this.count.update((c) => c - 1);
  }

  reset(): void {
    this.count.set(0);
  }

  set(value: number): void {
    this.count.set(value);
  }
}

describe('Async Testing', () => {
  describe('Promise testing', () => {
    test('should handle async/await', async () => {
      const service = new AsyncDataService();
      const result = await service.getData();
      expect(result).toEqual(['item1', 'item2', 'item3']);
    });

    test('should handle Promise rejection', async () => {
      const service = new AsyncDataService();
      await expect(service.getError()).rejects.toThrow('Async error');
    });

    test('should handle Promise with timeout', async () => {
      const slowPromise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('done'), 50);
      });

      const result = await slowPromise;
      expect(result).toBe('done');
    });

    test('should handle multiple promises with Promise.all', async () => {
      const service = new AsyncDataService();
      const [data, error] = await Promise.all([
        service.getData().catch(() => []),
        service.getError().catch((e) => e.message),
      ]);

      expect(data).toEqual(['item1', 'item2', 'item3']);
      expect(error).toBe('Async error');
    });

    test('should handle Promise.race', async () => {
      const fast = Promise.resolve('fast');
      const slow = new Promise<string>((resolve) => setTimeout(() => resolve('slow'), 100));

      const result = await Promise.race([fast, slow]);
      expect(result).toBe('fast');
    });
  });

  describe('Observable testing', () => {
    test('should subscribe to observable', (done) => {
      const service = new AsyncDataService();
      service.getObservable().subscribe({
        next: (value) => {
          expect(value).toEqual([1, 2, 3]);
          done();
        },
        error: done,
      });
    });

    test('should handle observable error', (done) => {
      const service = new AsyncDataService();
      service.getErrorObservable().subscribe({
        next: () => done(new Error('Should not emit')),
        error: (error) => {
          expect(error.message).toBe('Observable error');
          done();
        },
      });
    });

    test('should use async/await with lastValueFrom pattern', async () => {
      const service = new AsyncDataService();

      // Convert observable to promise
      const result = await new Promise<number[]>((resolve) => {
        service.getObservable().subscribe(resolve);
      });

      expect(result).toEqual([1, 2, 3]);
    });

    test('should collect all emissions with toArray pattern', async () => {
      const service = new AsyncDataService();
      const values: number[] = [];

      await new Promise<void>((resolve) => {
        service.getObservable().subscribe({
          next: (v) => values.push(...v),
          complete: resolve,
        });
      });

      expect(values).toEqual([1, 2, 3]);
    });
  });

  describe('Signal testing', () => {
    let service: SignalCounterService;

    beforeEach(() => {
      service = new SignalCounterService();
    });

    test('should read signal value', () => {
      expect(service.value()).toBe(0);
    });

    test('should update signal with increment', () => {
      service.increment();
      expect(service.value()).toBe(1);
    });

    test('should update signal with decrement', () => {
      service.decrement();
      expect(service.value()).toBe(-1);
    });

    test('should reset signal', () => {
      service.increment();
      service.increment();
      service.reset();
      expect(service.value()).toBe(0);
    });

    test('should set signal to specific value', () => {
      service.set(42);
      expect(service.value()).toBe(42);
    });

    test('should update computed signal', () => {
      service.set(5);
      expect(service.doubled()).toBe(10);
    });

    test('should update boolean computed signal', () => {
      expect(service.isEven()).toBe(true);
      service.increment();
      expect(service.isEven()).toBe(false);
      service.increment();
      expect(service.isEven()).toBe(true);
    });

    test('should track signal changes', () => {
      const changes: number[] = [];

      // Simulate effect tracking
      changes.push(service.value());
      service.increment();
      changes.push(service.value());
      service.increment();
      changes.push(service.value());

      expect(changes).toEqual([0, 1, 2]);
    });

    test('should handle multiple signal updates', () => {
      for (let i = 0; i < 10; i++) {
        service.increment();
      }
      expect(service.value()).toBe(10);
      expect(service.doubled()).toBe(20);
      expect(service.isEven()).toBe(true);
    });
  });

  describe('Timing and delays', () => {
    test('should wait for timeout', async () => {
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 50));
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(45); // Allow some tolerance
    });

    test('should use Bun.test timeout', async () => {
      // Bun test has built-in timeout handling
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(true).toBe(true);
    });

    test('should handle interval-based operations', async () => {
      const values: number[] = [];

      const interval = setInterval(() => {
        values.push(values.length);
        if (values.length >= 3) {
          clearInterval(interval);
        }
      }, 10);

      // Wait for interval to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(values).toEqual([0, 1, 2]);
    });
  });

  describe('Mocking async operations', () => {
    test('should mock Promise', async () => {
      const mockPromise = Promise.resolve(['mocked', 'data']);
      const result = await mockPromise;
      expect(result).toEqual(['mocked', 'data']);
    });

    test('should mock rejected Promise', async () => {
      const mockError = async () => {
        throw new Error('Mocked error');
      };
      await expect(mockError()).rejects.toThrow('Mocked error');
    });

    test('should mock Observable', () => {
      const mockObservable = of('mocked', 'observable', 'data');

      mockObservable.subscribe({
        next: (value) => expect(typeof value).toBe('string'),
      });
    });

    test('should create delayed mock', async () => {
      const createDelayedMock = <T>(value: T, delay: number) =>
        new Promise<T>((resolve) => setTimeout(() => resolve(value), delay));

      const result = await createDelayedMock('delayed', 50);
      expect(result).toBe('delayed');
    });
  });

  describe('Error handling', () => {
    test('should handle async error in try/catch', async () => {
      const asyncFunction = async () => {
        throw new Error('Test error');
      };

      try {
        await asyncFunction();
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Test error');
      }
    });

    test('should use expect().rejects for async errors', async () => {
      const asyncFunction = async () => {
        throw new Error('Expected error');
      };

      await expect(asyncFunction()).rejects.toThrow('Expected error');
    });

    test('should handle multiple error types', async () => {
      const functions = [
        async () => {
          throw new TypeError('Type error');
        },
        async () => {
          throw new RangeError('Range error');
        },
      ];

      await expect(functions[0]()).rejects.toBeInstanceOf(TypeError);
      await expect(functions[1]()).rejects.toBeInstanceOf(RangeError);
    });
  });
});
