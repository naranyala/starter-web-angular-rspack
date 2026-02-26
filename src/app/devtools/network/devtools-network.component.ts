import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { HttpLogEntry } from '../http-tracking.interceptor';

@Component({
  selector: 'app-devtools-network',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="network-container">
      <div class="network-header">
        <h2>Network Requests</h2>
        <div class="header-actions">
          <input
            type="text"
            class="search-input"
            placeholder="Filter URLs..."
            [(ngModel)]="filterQuery"
          />
          <button class="clear-btn" (click)="clearLogs()">Clear</button>
        </div>
      </div>

      <!-- Summary -->
      <div class="network-summary">
        <div class="summary-item">
          <span class="summary-value">{{ filteredLogs.length }}</span>
          <span class="summary-label">Requests</span>
        </div>
        <div class="summary-item">
          <span class="summary-value success">{{ successCount() }}</span>
          <span class="summary-label">Success</span>
        </div>
        <div class="summary-item">
          <span class="summary-value error">{{ errorCount() }}</span>
          <span class="summary-label">Failed</span>
        </div>
        <div class="summary-item">
          <span class="summary-value pending">{{ pendingCount() }}</span>
          <span class="summary-label">Pending</span>
        </div>
        <div class="summary-item">
          <span class="summary-value">{{ totalDuration() }}ms</span>
          <span class="summary-label">Total Time</span>
        </div>
      </div>

      <!-- Request List -->
      <div class="request-list">
        @if (filteredLogs.length > 0) {
          @for (log of filteredLogs; track log.id) {
            <div
              class="request-item"
              [class.selected]="selectedLog()?.id === log.id"
              [class.error]="log.status && log.status >= 400"
              [class.pending]="log.inProgress"
              (click)="selectLog(log)">
              <span class="request-method" [class]="getMethodClass(log.method)">
                {{ log.method }}
              </span>
              <span class="request-url" title="{{ log.url }}">{{ truncateUrl(log.url) }}</span>
              <span class="request-status" *ngIf="log.status" [class]="getStatusClass(log.status)">
                {{ log.status }}
              </span>
              <span class="request-duration" *ngIf="log.duration">
                {{ log.duration }}ms
              </span>
              <span class="request-in-progress" *ngIf="log.inProgress">⏳</span>
            </div>
          }
        } @else {
          <div class="empty-state">
            <span class="empty-icon">🌐</span>
            <p>No network requests</p>
            <span class="empty-hint">HTTP requests will appear here as they are made</span>
          </div>
        }
      </div>

      <!-- Request Details -->
      @if (selectedLog()) {
        <div class="request-details">
          <div class="details-header">
            <h3>Request Details</h3>
            <button class="close-btn" (click)="deselectLog()">✕</button>
          </div>

          <div class="details-content">
            <div class="detail-section">
              <h4>General</h4>
              <div class="detail-row">
                <span class="detail-label">URL:</span>
                <span class="detail-value">{{ selectedLog()?.url }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Method:</span>
                <span class="detail-value method">{{ selectedLog()?.method }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedLog()?.status">
                <span class="detail-label">Status:</span>
                <span class="detail-value" [class]="getStatusClass(selectedLog()?.status || 0)">
                  {{ selectedLog()?.status }} {{ selectedLog()?.statusText }}
                </span>
              </div>
              <div class="detail-row" *ngIf="selectedLog()?.duration">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">{{ selectedLog()?.duration }}ms</span>
              </div>
            </div>

            <div class="detail-section" *ngIf="selectedLog()?.requestHeaders && hasKeys(selectedLog()?.requestHeaders)">
              <h4>Request Headers</h4>
              <div class="headers-list">
                @for (header of getEntries(selectedLog()?.requestHeaders); track header.key) {
                  <div class="header-row">
                    <span class="header-key">{{ header.key }}:</span>
                    <span class="header-value">{{ header.value }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="detail-section" *ngIf="selectedLog()?.responseHeaders && hasKeys(selectedLog()?.responseHeaders)">
              <h4>Response Headers</h4>
              <div class="headers-list">
                @for (header of getEntries(selectedLog()?.responseHeaders); track header.key) {
                  <div class="header-row">
                    <span class="header-key">{{ header.key }}:</span>
                    <span class="header-value">{{ header.value }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="detail-section" *ngIf="selectedLog()?.requestBody">
              <h4>Request Body</h4>
              <pre class="body-content">{{ formatBody(selectedLog()?.requestBody) }}</pre>
            </div>

            <div class="detail-section" *ngIf="selectedLog()?.responseBody">
              <h4>Response Body</h4>
              <pre class="body-content">{{ formatBody(selectedLog()?.responseBody) }}</pre>
            </div>

            <div class="detail-section" *ngIf="selectedLog()?.error">
              <h4>Error</h4>
              <pre class="error-content">{{ selectedLog()?.error }}</pre>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
    .network-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .network-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #333;
    }

    .network-header h2 {
      color: #fff;
      font-size: 18px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .search-input {
      padding: 6px 12px;
      background: #2d2d30;
      border: 1px solid #333;
      border-radius: 4px;
      color: #fff;
      font-size: 13px;
      width: 180px;
    }

    .search-input:focus {
      outline: none;
      border-color: #007acc;
    }

    .clear-btn {
      padding: 6px 12px;
      background: transparent;
      border: 1px solid #f44336;
      border-radius: 4px;
      color: #f44336;
      font-size: 12px;
      cursor: pointer;
    }

    .clear-btn:hover {
      background: #f44336;
      color: #fff;
    }

    .network-summary {
      display: flex;
      gap: 16px;
      padding: 12px 16px;
      background: #252526;
      border-bottom: 1px solid #333;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .summary-value {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }

    .summary-value.success { color: #4caf50; }
    .summary-value.error { color: #f44336; }
    .summary-value.pending { color: #ff9800; }

    .summary-label {
      font-size: 11px;
      color: #858585;
    }

    .request-list {
      flex: 1;
      overflow-y: auto;
      background: #1e1e1e;
    }

    .request-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-bottom: 1px solid #333;
      cursor: pointer;
      transition: background 0.15s;
    }

    .request-item:hover {
      background: #2d2d30;
    }

    .request-item.selected {
      background: #0f3460;
      border-left: 3px solid #007acc;
    }

    .request-item.error {
      border-left: 3px solid #f44336;
    }

    .request-item.pending {
      opacity: 0.7;
    }

    .request-method {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      min-width: 50px;
      text-align: center;
    }

    .request-method.GET { background: #4caf50; color: #fff; }
    .request-method.POST { background: #2196f3; color: #fff; }
    .request-method.PUT { background: #ff9800; color: #fff; }
    .request-method.DELETE { background: #f44336; color: #fff; }
    .request-method.PATCH { background: #9c27b0; color: #fff; }

    .request-url {
      flex: 1;
      color: #4ec9b0;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .request-status {
      font-size: 12px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .request-status.success { background: #4caf50; color: #fff; }
    .request-status.error { background: #f44336; color: #fff; }
    .request-status.redirect { background: #ff9800; color: #fff; }

    .request-duration {
      color: #858585;
      font-size: 12px;
      min-width: 60px;
      text-align: right;
    }

    .request-in-progress {
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .request-details {
      border-top: 2px solid #0f3460;
      background: #252526;
      max-height: 50%;
      overflow-y: auto;
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #333;
    }

    .details-header h3 {
      color: #fff;
      font-size: 14px;
      margin: 0;
    }

    .close-btn {
      padding: 4px 10px;
      background: transparent;
      border: none;
      color: #858585;
      font-size: 18px;
      cursor: pointer;
    }

    .close-btn:hover {
      color: #fff;
    }

    .details-content {
      padding: 16px;
    }

    .detail-section {
      margin-bottom: 20px;
    }

    .detail-section h4 {
      color: #858585;
      font-size: 12px;
      margin: 0 0 12px;
      text-transform: uppercase;
    }

    .detail-row {
      display: flex;
      padding: 6px 0;
      border-bottom: 1px solid #333;
    }

    .detail-label {
      color: #858585;
      font-size: 12px;
      min-width: 100px;
    }

    .detail-value {
      color: #fff;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
    }

    .detail-value.method {
      color: #4ec9b0;
      font-weight: 600;
    }

    .headers-list {
      background: #2d2d30;
      border-radius: 4px;
      padding: 8px;
    }

    .header-row {
      display: flex;
      padding: 4px 0;
      font-size: 12px;
    }

    .header-key {
      color: #9cdcfe;
      min-width: 150px;
      font-family: 'Consolas', 'Monaco', monospace;
    }

    .header-value {
      color: #ce9178;
      word-break: break-all;
    }

    .body-content, .error-content {
      background: #2d2d30;
      border-radius: 4px;
      padding: 12px;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      color: #d4d4d4;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 200px;
      overflow-y: auto;
      margin: 0;
    }

    .error-content {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
      border: 1px solid #f44336;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #858585;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state p {
      font-size: 16px;
      margin: 0 0 8px;
    }

    .empty-hint {
      font-size: 12px;
      opacity: 0.7;
    }
  `,
  ],
})
export class DevtoolsNetworkComponent {
  @Input() httpLogs: HttpLogEntry[] = [];
  @Output() clearLogsRequest = new EventEmitter<void>();
  filterQuery = signal('');
  selectedLog = signal<HttpLogEntry | null>(null);

  get filteredLogs(): HttpLogEntry[] {
    const query = this.filterQuery().toLowerCase();
    if (!query) return this.httpLogs;
    return this.httpLogs.filter((log) => log.url.toLowerCase().includes(query));
  }

  successCount(): number {
    return this.httpLogs.filter((log) => log.status && log.status >= 200 && log.status < 300)
      .length;
  }

  errorCount(): number {
    return this.httpLogs.filter((log) => log.status && log.status >= 400).length;
  }

  pendingCount(): number {
    return this.httpLogs.filter((log) => log.inProgress).length;
  }

  totalDuration(): number {
    return this.httpLogs
      .filter((log) => log.duration)
      .reduce((sum, log) => sum + (log.duration || 0), 0);
  }

  selectLog(log: HttpLogEntry): void {
    this.selectedLog.set(log);
  }

  deselectLog(): void {
    this.selectedLog.set(null);
  }

  clearLogs(): void {
    this.clearLogsRequest.emit();
  }

  getMethodClass(method: string): string {
    return method.toUpperCase();
  }

  getStatusClass(status: number): string {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'redirect';
    return 'error';
  }

  truncateUrl(url: string): string {
    if (url.length <= 60) return url;
    return `${url.substring(0, 60)}...`;
  }

  hasKeys(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }

  getEntries(obj: any): { key: string; value: string }[] {
    if (!obj) return [];
    return Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }));
  }

  formatBody(body: any): string {
    if (typeof body === 'string') return body;
    try {
      return JSON.stringify(body, null, 2);
    } catch {
      return String(body);
    }
  }
}
