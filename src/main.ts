import 'zone.js';
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, ErrorHandler, Provider } from '@angular/core';
import { AppComponent } from './app/app.component';
import { DemoComponent } from './app/demo/demo.component';
import { 
  AngularGlobalErrorHandler,
  GlobalErrorHandlerService,
  WindowErrorHandlerService,
} from './app/shared';

// Factory to initialize window error handler
function initializeWindowErrorHandler(handler: WindowErrorHandlerService): () => Promise<void> {
  return () => {
    handler.init();
    return Promise.resolve();
  };
}

// Providers for error handling
const errorHandlingProviders: Provider[] = [
  {
    provide: ErrorHandler,
    useClass: AngularGlobalErrorHandler,
  },
  {
    provide: APP_INITIALIZER,
    useFactory: initializeWindowErrorHandler,
    deps: [WindowErrorHandlerService],
    multi: true,
  },
];

bootstrapApplication(DemoComponent, {
  providers: [
    provideAnimations(),
    ...errorHandlingProviders,
  ],
})
.catch((err) => {
  // Bootstrap error - log to console and dispatch event
  console.error('[Bootstrap Error]', err);
  window.dispatchEvent(new CustomEvent('app:bootstrap-error', { detail: err }));
});
