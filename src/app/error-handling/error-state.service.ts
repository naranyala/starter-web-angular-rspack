import { computed, Injectable, signal } from '@angular/core';

export interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: Date;
  type: 'angular' | 'javascript' | 'network' | 'unknown';
  severity: 'critical' | 'error' | 'warning';
  component?: string;
}

/**
 * Error State Service - Manages application error state using signals
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorStateService {
  private readonly errors = signal<ErrorInfo[]>([]);
  private readonly currentError = signal<ErrorInfo | null>(null);
  private readonly isModalOpen = signal(false);

  // Computed signals
  readonly errors$ = this.errors.asReadonly();
  readonly currentError$ = this.currentError.asReadonly();
  readonly isModalOpen$ = this.isModalOpen.asReadonly();
  readonly errorCount = computed(() => this.errors().length);
  readonly hasErrors = computed(() => this.errors().length > 0);
  readonly hasCriticalErrors = computed(() => this.errors().some((e) => e.severity === 'critical'));

  /**
   * Add a new error and optionally show modal
   */
  addError(error: Partial<ErrorInfo>, showModal = true): ErrorInfo {
    const errorInfo: ErrorInfo = {
      id: this.generateId(),
      message: error.message || 'Unknown error occurred',
      stack: error.stack,
      url: error.url || window.location.href,
      lineNumber: error.lineNumber,
      columnNumber: error.columnNumber,
      timestamp: error.timestamp || new Date(),
      type: error.type || 'unknown',
      severity: error.severity || 'error',
      component: error.component,
    };

    this.errors.update((errors) => [errorInfo, ...errors].slice(0, 50)); // Keep last 50 errors

    if (showModal) {
      this.currentError.set(errorInfo);
      this.isModalOpen.set(true);
    }

    return errorInfo;
  }

  /**
   * Show error modal with specific error
   */
  showError(error: ErrorInfo): void {
    this.currentError.set(error);
    this.isModalOpen.set(true);
  }

  /**
   * Close error modal
   */
  closeModal(): void {
    this.isModalOpen.set(false);
    setTimeout(() => {
      this.currentError.set(null);
    }, 200);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors.set([]);
    this.currentError.set(null);
    this.isModalOpen.set(false);
  }

  /**
   * Remove specific error
   */
  removeError(id: string): void {
    this.errors.update((errors) => errors.filter((e) => e.id !== id));
  }

  /**
   * Get error by ID
   */
  getError(id: string): ErrorInfo | undefined {
    return this.errors().find((e) => e.id === id);
  }

  /**
   * Export errors to JSON
   */
  exportErrors(): string {
    return JSON.stringify(this.errors(), null, 2);
  }

  /**
   * Copy error details to clipboard
   */
  async copyErrorToClipboard(error: ErrorInfo): Promise<boolean> {
    const text = this.formatErrorForClipboard(error);
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Report error to external service (placeholder)
   */
  reportError(error: ErrorInfo, service: 'sentry' | 'logrocket' | 'custom' = 'custom'): void {
    console.log(`Reporting error to ${service}:`, error);
    // Implement actual error reporting service integration here
    // Example: Sentry.captureException(error);
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatErrorForClipboard(error: ErrorInfo): string {
    return `Error Report
============
ID: ${error.id}
Time: ${error.timestamp.toISOString()}
Type: ${error.type}
Severity: ${error.severity}
Message: ${error.message}
URL: ${error.url}
${error.lineNumber ? `Line: ${error.lineNumber}` : ''}
${error.component ? `Component: ${error.component}` : ''}

Stack Trace:
${error.stack || 'No stack trace available'}
`;
  }
}
