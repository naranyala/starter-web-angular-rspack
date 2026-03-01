import { Injectable, NgZone } from '@angular/core';
import { GlobalErrorHandlerService } from './global-error-handler.service';

@Injectable({ providedIn: 'root' })
export class WindowErrorHandlerService {
  constructor(
    private errorHandler: GlobalErrorHandlerService,
    private ngZone: NgZone
  ) {}

  init(): void {
    // Handle uncaught global errors
    window.addEventListener('error', (event) => {
      this.ngZone.run(() => {
        this.errorHandler.handleError(event.error || event.message, {
          component: 'Window',
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.ngZone.run(() => {
        this.errorHandler.handleError(event.reason, {
          component: 'Promise',
          context: {
            type: 'unhandledrejection',
          },
        });
      });
    });

    // Handle Angular zone errors
    NgZone.onError.subscribe((error) => {
      this.errorHandler.handleError(error, {
        component: 'NgZone',
      });
    });
  }

  destroy(): void {
    // Cleanup if needed
  }
}
