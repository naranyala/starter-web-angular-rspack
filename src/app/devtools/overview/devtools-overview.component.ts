import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { DevtoolsService } from '../devtools.service';
import './devtools-overview.component.css';

@Component({
  selector: 'app-devtools-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overview-container">
      <div class="overview-header">
        <h2>Application Overview</h2>
        <button class="refresh-btn" (click)="refresh()" title="Refresh">🔄</button>
      </div>

      <div class="overview-grid">
        <!-- Build Info Card -->
        <div class="info-card">
          <div class="card-header">
            <span class="card-icon">📦</span>
            <h3>Build Information</h3>
          </div>
          <div class="card-content">
            <div class="info-row" *ngIf="buildInfo?.angularVersion">
              <span class="info-label">Angular Version:</span>
              <span class="info-value version-badge">{{ buildInfo.angularVersion }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">TypeScript Version:</span>
              <span class="info-value">{{ buildInfo?.typescriptVersion || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Build Mode:</span>
              <span class="info-value" [class.production]="buildInfo?.production">
                {{ buildInfo?.production ? 'Production' : 'Development' }}
              </span>
            </div>
            <div class="info-row" *ngIf="buildInfo?.rspackVersion">
              <span class="info-label">Rspack Version:</span>
              <span class="info-value">{{ buildInfo.rspackVersion }}</span>
            </div>
            <div class="info-row" *ngIf="buildInfo?.bunVersion">
              <span class="info-label">Bun Version:</span>
              <span class="info-value">{{ buildInfo.bunVersion }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Build Time:</span>
              <span class="info-value">{{ buildInfo?.buildTime | date:'medium' }}</span>
            </div>
          </div>
        </div>

        <!-- Statistics Card -->
        <div class="info-card">
          <div class="card-header">
            <span class="card-icon">📊</span>
            <h3>Statistics</h3>
          </div>
          <div class="card-content">
            <div class="stat-item">
              <span class="stat-value">{{ componentCount }}</span>
              <span class="stat-label">Components</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ serviceCount }}</span>
              <span class="stat-label">Services</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ getDirectiveCount() }}</span>
              <span class="stat-label">Directives</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ getPipeCount() }}</span>
              <span class="stat-label">Pipes</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions Card -->
        <div class="info-card">
          <div class="card-header">
            <span class="card-icon">⚡</span>
            <h3>Quick Actions</h3>
          </div>
          <div class="card-content">
            <button class="action-btn" (click)="triggerChangeDetection()">
              🔁 Trigger Change Detection
            </button>
            <button class="action-btn" (click)="clearConsole()">
              🗑️ Clear Console
            </button>
            <button class="action-btn" (click)="copyAppInfo()">
              📋 Copy App Info
            </button>
            <button class="action-btn" (click)="openInNewTab()">
              🔗 Open in New Tab
            </button>
          </div>
        </div>

        <!-- Environment Card -->
        <div class="info-card">
          <div class="card-header">
            <span class="card-icon">🌍</span>
            <h3>Environment</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="info-label">User Agent:</span>
              <span class="info-value user-agent">{{ getUserAgent() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Viewport:</span>
              <span class="info-value">{{ getViewport() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Online:</span>
              <span class="info-value" [class.online]="isOnline()">
                {{ isOnline() ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Language:</span>
              <span class="info-value">{{ getLanguage() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DevtoolsOverviewComponent {
  @Input() buildInfo: any;
  @Input() componentCount = 0;
  @Input() serviceCount = 0;

  constructor(private devtoolsService: DevtoolsService) {}

  refresh(): void {
    window.location.reload();
  }

  triggerChangeDetection(): void {
    this.devtoolsService.triggerChangeDetection();
  }

  clearConsole(): void {
    console.clear();
  }

  copyAppInfo(): void {
    const info = {
      angularVersion: this.buildInfo?.angularVersion,
      typescriptVersion: this.buildInfo?.typescriptVersion,
      production: this.buildInfo?.production,
      timestamp: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(info, null, 2));
  }

  openInNewTab(): void {
    window.open(window.location.href, '_blank');
  }

  getUserAgent(): string {
    return `${navigator.userAgent.substring(0, 50)}...`;
  }

  getViewport(): string {
    return `${window.innerWidth}x${window.innerHeight}`;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  getLanguage(): string {
    return navigator.language;
  }

  getDirectiveCount(): number {
    return document.querySelectorAll(
      '[ngFor], [ngIf], [ngSwitch], [routerLink], [appHighlight], [appAutofocus], [appDebounceClick], [appRipple]'
    ).length;
  }

  getPipeCount(): number {
    // Pipes are harder to count without AST access
    return 6; // Based on pipes.ts
  }
}
