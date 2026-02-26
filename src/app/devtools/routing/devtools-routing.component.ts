import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { DevtoolsService } from '../devtools.service';

interface RouteInfo {
  path: string;
  url: string;
  routeConfig: any;
  params: Record<string, string>;
  queryParams: Record<string, string>;
  fragment: string | null;
}

interface NavigationEntry {
  url: string;
  timestamp: number;
  type: 'navigation' | 'error' | 'cancel';
  details?: string;
}

@Component({
  selector: 'app-devtools-routing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="routing-container">
      <div class="routing-header">
        <h2>Routing Information</h2>
        <button class="refresh-btn" (click)="refresh()">🔄</button>
      </div>

      <!-- Current Route -->
      <div class="route-section">
        <h3>📍 Current Route</h3>
        <div class="current-route-card">
          <div class="route-row">
            <span class="route-label">Path:</span>
            <code class="route-value">{{ currentRoute?.path || 'N/A' }}</code>
          </div>
          <div class="route-row">
            <span class="route-label">URL:</span>
            <code class="route-value url">{{ currentRoute?.url || 'N/A' }}</code>
          </div>
          <div class="route-row" *ngIf="currentRoute?.routeConfig?.component">
            <span class="route-label">Component:</span>
            <code class="route-value">{{ currentRoute?.routeConfig?.component }}</code>
          </div>
          <div class="route-row" *ngIf="currentRoute?.params && hasKeys(currentRoute?.params)">
            <span class="route-label">Params:</span>
            <div class="params-list">
              @for (param of getEntries(currentRoute?.params); track param.key) {
                <span class="param-badge">
                  {{ param.key }}: <strong>{{ param.value }}</strong>
                </span>
              }
            </div>
          </div>
          <div class="route-row" *ngIf="currentRoute?.queryParams && hasKeys(currentRoute?.queryParams)">
            <span class="route-label">Query Params:</span>
            <div class="params-list">
              @for (param of getEntries(currentRoute?.queryParams); track param.key) {
                <span class="param-badge query">
                  {{ param.key }}: <strong>{{ param.value }}</strong>
                </span>
              }
            </div>
          </div>
          <div class="route-row" *ngIf="currentRoute?.fragment">
            <span class="route-label">Fragment:</span>
            <code class="route-value">#{{ currentRoute?.fragment }}</code>
          </div>
        </div>
      </div>

      <!-- Navigation History -->
      <div class="route-section">
        <div class="section-header">
          <h3>📜 Navigation History</h3>
          <button class="clear-btn" (click)="clearHistory()">Clear</button>
        </div>
        <div class="history-list">
          @if (navigationHistory && navigationHistory.length > 0) {
            @for (entry of navigationHistory; track entry.timestamp) {
              <div class="history-item" [class.error]="entry.type === 'error'" [class.cancel]="entry.type === 'cancel'">
                <span class="history-type" [class]="entry.type">{{ entry.type }}</span>
                <span class="history-url">{{ entry.url }}</span>
                <span class="history-time">{{ formatTime(entry.timestamp) }}</span>
                @if (entry.details) {
                  <span class="history-details" title="{{ entry.details }}">⚠️</span>
                }
              </div>
            }
          } @else {
            <div class="empty-state">
              <span class="empty-icon">📜</span>
              <p>No navigation history</p>
            </div>
          }
        </div>
      </div>

      <!-- Route Actions -->
      <div class="route-section">
        <h3>🔗 Quick Navigation</h3>
        <div class="quick-nav">
          <button class="nav-btn" (click)="navigate('/')">Home</button>
          <button class="nav-btn" (click)="navigate('/demo')">Demo</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .routing-container {
      padding: 16px;
    }

    .routing-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .routing-header h2 {
      color: #fff;
      font-size: 18px;
      margin: 0;
    }

    .refresh-btn {
      padding: 6px 12px;
      background: #0f3460;
      border: none;
      border-radius: 4px;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
    }

    .refresh-btn:hover {
      background: #164a8a;
    }

    .route-section {
      margin-bottom: 20px;
    }

    .route-section h3 {
      color: #858585;
      font-size: 13px;
      margin: 0 0 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .section-header h3 {
      margin: 0;
    }

    .current-route-card {
      background: #252526;
      border-radius: 6px;
      padding: 16px;
      border: 1px solid #333;
    }

    .route-row {
      display: flex;
      align-items: flex-start;
      padding: 8px 0;
      border-bottom: 1px solid #333;
    }

    .route-row:last-child {
      border-bottom: none;
    }

    .route-label {
      color: #858585;
      font-size: 12px;
      min-width: 100px;
      flex-shrink: 0;
    }

    .route-value {
      color: #fff;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      background: #2d2d30;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .route-value.url {
      color: #4ec9b0;
      word-break: break-all;
    }

    .params-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .param-badge {
      background: #0f3460;
      color: #fff;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 12px;
    }

    .param-badge.query {
      background: #164a8a;
    }

    .param-badge strong {
      color: #4ec9b0;
    }

    .history-list {
      background: #252526;
      border-radius: 6px;
      border: 1px solid #333;
      max-height: 300px;
      overflow-y: auto;
    }

    .history-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-bottom: 1px solid #333;
      font-size: 13px;
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .history-item:hover {
      background: #2d2d30;
    }

    .history-item.error {
      border-left: 3px solid #f44336;
    }

    .history-item.cancel {
      border-left: 3px solid #ff9800;
    }

    .history-type {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .history-type.navigation {
      background: #4caf50;
      color: #fff;
    }

    .history-type.error {
      background: #f44336;
      color: #fff;
    }

    .history-type.cancel {
      background: #ff9800;
      color: #fff;
    }

    .history-url {
      color: #4ec9b0;
      font-family: 'Consolas', 'Monaco', monospace;
      flex: 1;
      word-break: break-all;
    }

    .history-time {
      color: #858585;
      font-size: 11px;
      white-space: nowrap;
    }

    .history-details {
      cursor: help;
    }

    .clear-btn {
      padding: 4px 10px;
      background: transparent;
      border: 1px solid #f44336;
      border-radius: 4px;
      color: #f44336;
      font-size: 11px;
      cursor: pointer;
    }

    .clear-btn:hover {
      background: #f44336;
      color: #fff;
    }

    .quick-nav {
      display: flex;
      gap: 8px;
    }

    .nav-btn {
      padding: 8px 16px;
      background: #2d2d30;
      border: 1px solid #333;
      border-radius: 4px;
      color: #fff;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-btn:hover {
      background: #0f3460;
      border-color: #0f3460;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      color: #858585;
    }

    .empty-icon {
      font-size: 36px;
      margin-bottom: 12px;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }
  `,
  ],
})
export class DevtoolsRoutingComponent {
  @Input() currentRoute: RouteInfo | null = null;
  @Input() navigationHistory: NavigationEntry[] = [];

  constructor(private devtoolsService: DevtoolsService) {}

  refresh(): void {
    window.location.reload();
  }

  clearHistory(): void {
    this.devtoolsService.clearNavigationHistory();
  }

  navigate(path: string): void {
    // This would use Router in a real implementation
    window.location.href = path;
  }

  hasKeys(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }

  getEntries(obj: any): { key: string; value: string }[] {
    if (!obj) return [];
    return Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }));
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }
}
