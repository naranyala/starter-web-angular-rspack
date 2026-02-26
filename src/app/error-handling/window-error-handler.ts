import { Injectable, NgZone } from '@angular/core';
import { ErrorStateService } from './error-state.service';

/**
 * Window Error Handler - Catches global JavaScript errors
 */
@Injectable({
  providedIn: 'root',
})
export class WindowErrorHandler {
  private initialized = false;

  constructor(
    private errorStateService: ErrorStateService,
    private ngZone: NgZone
  ) {}

  /**
   * Initialize global error listeners
   */
  init(): void {
    if (this.initialized) return;

    // Listen for unhandled errors
    window.addEventListener('error', (event) => this.handleWindowError(event));

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => this.handleUnhandledRejection(event));

    this.initialized = true;
  }

  private handleWindowError(event: ErrorEvent): void {
    // Run outside Angular zone to prevent infinite loops
    this.ngZone.runOutsideAngular(() => {
      this.errorStateService.addError({
        message: event.message,
        url: event.filename || undefined,
        lineNumber: event.lineno || undefined,
        columnNumber: event.colno || undefined,
        type: 'javascript',
        severity: this.determineSeverity(event.message),
        timestamp: new Date(),
      });
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.ngZone.runOutsideAngular(() => {
      const error = event.reason;

      this.errorStateService.addError({
        message: error?.message || error?.toString() || 'Unhandled Promise Rejection',
        stack: error?.stack,
        type: 'javascript',
        severity: 'error',
        timestamp: new Date(),
      });
    });
  }

  private determineSeverity(message: string): 'critical' | 'error' | 'warning' {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('script error') ||
      lowerMessage.includes('uncaught') ||
      lowerMessage.includes('syntaxerror')
    ) {
      return 'critical';
    }

    if (lowerMessage.includes('deprecated') || lowerMessage.includes('warning')) {
      return 'warning';
    }

    return 'error';
  }
}
