/**
 * Test Data Factories
 *
 * Provides factory functions for creating test data objects
 * with sensible defaults that can be overridden.
 */

import type { CardItem } from '../app/demo/demo.component';

/**
 * Creates a mock CardItem with default values
 *
 * @example
 * ```typescript
 * const card = createMockCard({ title: 'Custom Title' });
 * ```
 */
export function createMockCard(overrides: Partial<CardItem> = {}): CardItem {
  return {
    title: overrides.title ?? 'Test Card',
    description: overrides.description ?? 'Test description',
    icon: overrides.icon ?? '🧪',
    color: overrides.color ?? '#007bff',
    content: overrides.content ?? '<p>Test content</p>',
    link: overrides.link,
  };
}

/**
 * Creates an array of mock CardItems
 *
 * @example
 * ```typescript
 * const cards = createMockCards(5);
 * ```
 */
export function createMockCards(count: number): CardItem[] {
  return Array.from({ length: count }, (_, i) =>
    createMockCard({
      title: `Card ${i + 1}`,
      description: `Description for card ${i + 1}`,
    })
  );
}

/**
 * Creates a mock user object
 */
export interface MockUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  active: boolean;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? 'Test User',
    email: overrides.email ?? 'test@example.com',
    role: overrides.role ?? 'user',
    active: overrides.active ?? true,
  };
}

/**
 * Creates an array of mock users
 */
export function createMockUsers(count: number): MockUser[] {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
    })
  );
}

/**
 * Creates a mock error object
 */
export function createMockError(message: string, overrides: Partial<Error> = {}): Error {
  const error = new Error(message);
  Object.assign(error, overrides);
  return error;
}

/**
 * Creates a mock HTTP response
 */
export interface MockHttpResponse<T> {
  body: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export function createMockHttpResponse<T>(
  body: T,
  overrides: Partial<MockHttpResponse<T>> = {}
): MockHttpResponse<T> {
  return {
    body,
    status: overrides.status ?? 200,
    statusText: overrides.statusText ?? 'OK',
    headers: overrides.headers ?? {},
  };
}

/**
 * Creates a mock observable-like object for testing
 */
export function createMockObservable<T>(value: T) {
  return {
    subscribe: (callback: (v: T) => void) => {
      callback(value);
      return { unsubscribe: () => {} };
    },
    pipe: () => createMockObservable(value),
  };
}

/**
 * Creates a mock promise that resolves after a delay
 */
export function createDelayedPromise<T>(value: T, delay: number = 100): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}

/**
 * Creates a mock promise that rejects after a delay
 */
export function createDelayedReject(error: Error, delay: number = 100): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(error), delay));
}
