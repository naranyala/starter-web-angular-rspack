import { describe, expect, test } from 'bun:test';
import { routes } from './app-routing.module';

describe('Routing Configuration', () => {
  test('should have routes configured', () => {
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
  });

  test('should have at least one route', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  test('should have home route configured', () => {
    const homeRoute = routes.find((r) => r.path === '');
    expect(homeRoute).toBeDefined();
    expect(homeRoute?.path).toBe('');
  });

  test('should export routes as array', () => {
    expect(Array.isArray(routes)).toBe(true);
  });

  test('should have route with component', () => {
    const routeWithComponent = routes.find((r) => r.component);
    expect(routeWithComponent).toBeDefined();
    expect(routeWithComponent?.component).toBeDefined();
  });
});
