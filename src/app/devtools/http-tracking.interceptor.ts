import {
  type HttpErrorResponse,
  type HttpEvent,
  type HttpHandler,
  type HttpInterceptor,
  type HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { type Observable, tap } from 'rxjs';

export interface HttpLogEntry {
  id: number;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  requestHeaders: Record<string, string>;
  requestBody?: unknown;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
  inProgress: boolean;
}

/**
 * HTTP Interceptor Service - Tracks all HTTP requests
 */
@Injectable({
  providedIn: 'root',
})
export class HttpTrackingService {
  private readonly httpLogs = signal<HttpLogEntry[]>([]);
  private requestId = 1;

  readonly httpLogs$ = this.httpLogs.asReadonly();

  getLogs(): HttpLogEntry[] {
    return this.httpLogs();
  }

  clearLogs(): void {
    this.httpLogs.set([]);
  }

  addLog(entry: Partial<HttpLogEntry>): HttpLogEntry {
    const log: HttpLogEntry = {
      id: this.requestId++,
      method: entry.method || 'GET',
      url: entry.url || '',
      status: entry.status,
      statusText: entry.statusText,
      requestHeaders: entry.requestHeaders || {},
      requestBody: entry.requestBody,
      responseHeaders: entry.responseHeaders,
      responseBody: entry.responseBody,
      startTime: entry.startTime || Date.now(),
      endTime: entry.endTime,
      duration: entry.duration,
      error: entry.error,
      inProgress: entry.inProgress ?? true,
    };

    this.httpLogs.update((logs) => [log, ...logs].slice(0, 100));
    return log;
  }

  updateLog(id: number, updates: Partial<HttpLogEntry>): void {
    this.httpLogs.update((logs) =>
      logs.map((log) => (log.id === id ? { ...log, ...updates } : log))
    );
  }
}

/**
 * HTTP Interceptor - Intercepts all HTTP requests for logging
 */
@Injectable()
export class HttpTrackingInterceptor implements HttpInterceptor {
  constructor(private trackingService: HttpTrackingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startTime = Date.now();
    const logEntry = this.trackingService.addLog({
      method: request.method,
      url: request.url,
      requestHeaders: this.headersToObject(request.headers),
      requestBody: request.body,
      startTime,
      inProgress: true,
    });

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            this.trackingService.updateLog(logEntry.id, {
              status: event.status,
              statusText: event.statusText,
              responseHeaders: this.headersToObject(event.headers),
              responseBody: event.body,
              endTime: Date.now(),
              duration: Date.now() - startTime,
              inProgress: false,
            });
          }
        },
        error: (error: HttpErrorResponse) => {
          this.trackingService.updateLog(logEntry.id, {
            status: error.status,
            statusText: error.statusText,
            error: error.message,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            inProgress: false,
          });
        },
      })
    );
  }

  private headersToObject(headers: any): Record<string, string> {
    const result: Record<string, string> = {};
    if (headers && typeof headers.keys === 'function') {
      headers.keys().forEach((key: string) => {
        result[key] = headers.get(key);
      });
    }
    return result;
  }
}
