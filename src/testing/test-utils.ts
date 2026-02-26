/**
 * Testing Utilities for Angular + Bun Test
 *
 * Provides helper functions and factories for testing Angular components,
 * services, pipes, and directives with Bun test.
 */

import { Location } from '@angular/common';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

/**
 * Options for configuring a component test
 */
export interface ComponentTestOptions<T> {
  /** Component class to test */
  component: new () => T;
  /** Additional imports for TestBed */
  imports?: any[];
  /** Additional declarations for TestBed */
  declarations?: any[];
  /** Additional providers for TestBed */
  providers?: any[];
  /** Component inputs */
  inputs?: Partial<T>;
  /** Whether to auto-detect changes */
  autoDetectChanges?: boolean;
}

/**
 * Test result containing fixture, component, and debug element
 */
export interface ComponentTestResult<T> {
  fixture: ComponentFixture<T>;
  component: T;
  nativeElement: HTMLElement;
}

/**
 * Creates and configures a component for testing
 *
 * @example
 * ```typescript
 * const { fixture, component, nativeElement } = createComponent({
 *   component: MyComponent,
 *   inputs: { name: 'test' }
 * });
 * ```
 */
export function createComponent<T>(options: ComponentTestOptions<T>): ComponentTestResult<T> {
  TestBed.configureTestingModule({
    imports: [RouterTestingModule, ...(options.imports || [])],
    declarations: options.declarations || [],
    providers: options.providers || [],
  });

  const fixture = TestBed.createComponent(options.component);

  if (options.inputs) {
    Object.assign(fixture.componentInstance, options.inputs);
  }

  if (options.autoDetectChanges) {
    fixture.autoDetectChanges();
  } else {
    fixture.detectChanges();
  }

  return {
    fixture,
    component: fixture.componentInstance,
    nativeElement: fixture.nativeElement as HTMLElement,
  };
}

/**
 * Resets the TestBed after each test
 * Should be called in afterEach hook
 */
export function resetTestBed(): void {
  afterEach(() => {
    TestBed.resetTestingModule();
  });
}

/**
 * Simulates a click event on an element
 *
 * @example
 * ```typescript
 * const button = nativeElement.querySelector('button');
 * click(button);
 * ```
 */
export function click(element: Element | null): void {
  if (!element) {
    throw new Error('Element is null');
  }
  element.dispatchEvent(new Event('click', { bubbles: true }));
}

/**
 * Simulates typing in an input element
 *
 * @example
 * ```typescript
 * const input = nativeElement.querySelector('input');
 * typeInElement(input, 'hello');
 * ```
 */
export function typeInElement(element: HTMLInputElement | null, text: string): void {
  if (!element) {
    throw new Error('Element is null');
  }
  element.value = text;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Waits for async operations to complete
 * Useful for testing async components
 */
export async function tick(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Router testing utilities
 */
export interface RouterTestResult {
  location: Location;
  router: Router;
  navigate: (path: string) => Promise<void>;
  getPath: () => string;
}

/**
 * Sets up router testing utilities
 *
 * @example
 * ```typescript
 * const { navigate, getPath } = setupRouterTesting();
 * await navigate('/demo');
 * expect(getPath()).toBe('/demo');
 * ```
 */
export function setupRouterTesting(): RouterTestResult {
  const location = TestBed.inject(Location);
  const router = TestBed.inject(Router);

  return {
    location,
    router,
    navigate: async (path: string) => {
      await router.navigate([path]);
    },
    getPath: () => location.path(),
  };
}

/**
 * Creates a mock provider
 *
 * @example
 * ```typescript
 * const mockService = createMock<DataService>({
 *   getData: () => ['item1', 'item2']
 * });
 * ```
 */
export function createMock<T>(overrides: Partial<T>): T {
  return overrides as T;
}

/**
 * Query helper for finding elements
 */
export function query<T extends Element>(root: HTMLElement, selector: string): T | null {
  return root.querySelector<T>(selector);
}

/**
 * Query all helper for finding multiple elements
 */
export function queryAll<T extends Element>(root: HTMLElement, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/**
 * Get text content from an element for assertions
 */
export const getText = (element: Element | null): string => {
  return element?.textContent?.trim() ?? '';
};

/**
 * Check if element contains text
 */
export const containsText = (element: Element | null, text: string): boolean => {
  return getText(element).includes(text);
};
