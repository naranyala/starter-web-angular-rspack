import { type ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { type ErrorInfo, ErrorStateService } from './error-state.service';

/**
 * Custom Error Handler - Catches unhandled Angular errors
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private errorService?: ErrorStateService;

  private injector = inject(Injector);

  handleError(error: any): void {
    // Lazy load error service to avoid circular dependency
    if (!this.errorService) {
      this.errorService = this.injector.get(ErrorStateService);
    }

    // Extract error details
    const errorInfo = this.extractErrorInfo(error);

    // Log to console (always)
    console.error('[GlobalErrorHandler]', errorInfo);

    // Show modal for critical errors
    const showModal = this.shouldShowModal(errorInfo);

    // Add to error state
    this.errorService.addError(
      {
        message: errorInfo.message,
        stack: errorInfo.stack,
        type: errorInfo.type,
        severity: errorInfo.severity,
        component: errorInfo.component,
        timestamp: new Date(),
      },
      showModal
    );

    // Report to external service if configured
    if (errorInfo.severity === 'critical') {
      const id = errorInfo.id;
      if (id) {
        const storedError = this.errorService.getError(id);
        this.errorService.reportError((storedError as any) || errorInfo);
      }
    }

    // Don't rethrow - we've handled it
    // In development, you might want to rethrow
    // throw error;
  }

  private extractErrorInfo(error: any): Partial<ErrorInfo> {
    // Angular error
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        type: 'angular',
        severity: this.determineSeverity(error),
        component: this.extractComponentName(error.stack),
      };
    }

    // String error
    if (typeof error === 'string') {
      return {
        message: error,
        type: 'javascript',
        severity: 'error',
      };
    }

    // Object error
    if (typeof error === 'object') {
      return {
        message: error.message || error.toString(),
        stack: error.stack,
        type: error.type || 'unknown',
        severity: error.severity || 'error',
      };
    }

    // Unknown error type
    return {
      message: String(error),
      type: 'unknown',
      severity: 'error',
    };
  }

  private determineSeverity(error: Error): 'critical' | 'error' | 'warning' {
    const message = error.message.toLowerCase();

    // Critical errors that break the app
    if (
      message.includes('ng0200') || // No provider
      message.includes('ng0100') || // Expression changed after checked
      message.includes('zone.js') || // Zone errors
      message.includes('infinity') ||
      message.includes('undefined is not a function')
    ) {
      return 'critical';
    }

    // Warning-level errors
    if (
      message.includes('deprecated') ||
      message.includes('deprecation') ||
      message.includes('expressionchangedafterit')
    ) {
      return 'warning';
    }

    // Standard errors
    return 'error';
  }

  private extractComponentName(stack?: string): string | undefined {
    if (!stack) return undefined;

    // Try to extract component name from stack trace
    const componentMatch = stack.match(/at (\w+)Component\./);
    if (componentMatch) {
      return `${componentMatch[1]}Component`;
    }

    // Try to extract file/component from stack
    const fileMatch = stack.match(/(\w+\.component)\.ts/);
    if (fileMatch) {
      return fileMatch[1];
    }

    return undefined;
  }

  private shouldShowModal(errorInfo: Partial<ErrorInfo>): boolean {
    // Always show modal for critical errors
    if (errorInfo.severity === 'critical') {
      return true;
    }

    // Show modal for errors with stack traces (likely unexpected)
    if (errorInfo.stack) {
      return true;
    }

    // Don't show modal for warnings
    if (errorInfo.severity === 'warning') {
      return false;
    }

    // Default: show modal for errors
    return true;
  }
}
