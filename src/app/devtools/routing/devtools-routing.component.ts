import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { DevtoolsService } from '../devtools.service';
import './devtools-routing.component.css';

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
