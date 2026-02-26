/**
 * Snapshot Testing Examples
 *
 * Demonstrates snapshot testing patterns with Bun test.
 * Note: Bun test doesn't have built-in snapshot testing like Jest,
 * so we implement a simple version using file-based snapshots.
 */

import { describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Simple snapshot utility
const SNAPSHOT_DIR = join(process.cwd(), '__snapshots__');

function ensureSnapshotDir(): void {
  if (!existsSync(SNAPSHOT_DIR)) {
    mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
}

function getSnapshotPath(testName: string): string {
  const safeName = testName.replace(/[^a-z0-9]/gi, '_');
  return join(SNAPSHOT_DIR, `${safeName}.snap`);
}

function toMatchSnapshot(
  received: unknown,
  testName: string
): { pass: boolean; message: () => string } {
  ensureSnapshotDir();
  const snapshotPath = getSnapshotPath(testName);
  const receivedJson = JSON.stringify(received, null, 2);

  if (!existsSync(snapshotPath)) {
    // First run - create snapshot
    writeFileSync(snapshotPath, receivedJson);
    return {
      pass: true,
      message: () => `Snapshot created at ${snapshotPath}`,
    };
  }

  const existingSnapshot = readFileSync(snapshotPath, 'utf-8');

  if (existingSnapshot === receivedJson) {
    return {
      pass: true,
      message: () => 'Snapshot matches',
    };
  }

  return {
    pass: false,
    message: () =>
      `Snapshot does not match.\nExpected:\n${existingSnapshot}\n\nReceived:\n${receivedJson}`,
  };
}

// Sample data structures for snapshot testing
interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

function createMockUser(): User {
  return {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['user', 'admin'],
    metadata: {
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  };
}

function createMockResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: '2024-01-01T00:00:00.000Z',
  };
}

describe('Snapshot Testing', () => {
  describe('Object snapshots', () => {
    test('should match user object snapshot', () => {
      const user = createMockUser();
      const result = toMatchSnapshot(user, 'user_object');
      expect(result.pass).toBe(true);
    });

    test('should match API response snapshot', () => {
      const response = createMockResponse(createMockUser());
      const result = toMatchSnapshot(response, 'api_response_user');
      expect(result.pass).toBe(true);
    });

    test('should match array snapshot', () => {
      const users = [createMockUser(), createMockUser()];
      users[1].id = 2;
      users[1].name = 'Jane Doe';

      const result = toMatchSnapshot(users, 'users_array');
      expect(result.pass).toBe(true);
    });
  });

  describe('String snapshots', () => {
    test('should match HTML snapshot', () => {
      const html = `
        <div class="container">
          <h1>Title</h1>
          <p>Content</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      `.trim();

      const result = toMatchSnapshot(html, 'html_template');
      expect(result.pass).toBe(true);
    });

    test('should match CSS snapshot', () => {
      const css = `
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .title {
          font-size: 24px;
          font-weight: bold;
        }
      `.trim();

      const result = toMatchSnapshot(css, 'css_styles');
      expect(result.pass).toBe(true);
    });

    test('should match JSON string snapshot', () => {
      const jsonString = JSON.stringify({
        key: 'value',
        nested: { a: 1, b: 2 },
        array: [1, 2, 3],
      });

      const result = toMatchSnapshot(jsonString, 'json_string');
      expect(result.pass).toBe(true);
    });
  });

  describe('Component output snapshots', () => {
    test('should match formatted output snapshot', () => {
      const formatUser = (user: User): string => {
        return `${user.name} <${user.email}> (${user.roles.join(', ')})`;
      };

      const output = formatUser(createMockUser());
      const result = toMatchSnapshot(output, 'formatted_user_output');
      expect(result.pass).toBe(true);
    });

    test('should match computed data snapshot', () => {
      const computeStats = (numbers: number[]) => ({
        count: numbers.length,
        sum: numbers.reduce((a, b) => a + b, 0),
        average: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
      });

      const stats = computeStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const result = toMatchSnapshot(stats, 'computed_stats');
      expect(result.pass).toBe(true);
    });
  });

  describe('Error snapshots', () => {
    test('should match error object snapshot', () => {
      const error = {
        name: 'ValidationError',
        message: 'Invalid input',
        details: [
          { field: 'email', message: 'Invalid email format' },
          { field: 'age', message: 'Must be positive' },
        ],
      };

      const result = toMatchSnapshot(error, 'validation_error');
      expect(result.pass).toBe(true);
    });

    test('should match error response snapshot', () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          statusCode: 404,
        },
      };

      const result = toMatchSnapshot(errorResponse, 'error_response');
      expect(result.pass).toBe(true);
    });
  });

  describe('Configuration snapshots', () => {
    test('should match config object snapshot', () => {
      const config = {
        apiUrl: 'https://api.example.com',
        timeout: 5000,
        retries: 3,
        features: {
          darkMode: true,
          notifications: true,
          analytics: false,
        },
      };

      const result = toMatchSnapshot(config, 'app_config');
      expect(result.pass).toBe(true);
    });
  });
});

// Inline snapshot helper (for simple cases)
function toMatchInlineSnapshot(received: unknown, expected: string): void {
  const receivedJson = JSON.stringify(received, null, 2);
  expect(receivedJson).toBe(expected);
}

describe('Inline Snapshots', () => {
  test('should match inline snapshot', () => {
    const user = { id: 1, name: 'Test' };
    toMatchInlineSnapshot(
      user,
      `{
  "id": 1,
  "name": "Test"
}`
    );
  });

  test('should match inline array snapshot', () => {
    const numbers = [1, 2, 3, 4, 5];
    toMatchInlineSnapshot(
      numbers,
      `[
  1,
  2,
  3,
  4,
  5
]`
    );
  });
});
