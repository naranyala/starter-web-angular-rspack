import { type ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { GlobalErrorHandler } from './error-handling/global-error-handler';
import { WindowErrorHandler } from './error-handling/window-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    WindowErrorHandler,
  ],
};
