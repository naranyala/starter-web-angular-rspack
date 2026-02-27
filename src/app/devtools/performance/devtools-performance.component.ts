import { CommonModule } from '@angular/common';
import { Component, Input, type OnDestroy, type OnInit } from '@angular/core';
import type { DevtoolsService } from '../devtools.service';
import './devtools-performance.component.css';

interface PerformanceMetrics {
  changeDetectionCount: number;
  lastChangeDetectionTime: number | null;
  averageChangeDetectionTime: number;
  componentCount: number;
  directiveCount: number;
  pipeCount: number;
  zoneStable: boolean;
  ngZoneInZone: boolean;
}

@Component({
  selector: 'app-devtools-performance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="performance-container">
      <div class="performance-header">
        <h2>Performance Metrics</h2>
        <button class="refresh-btn" (click)="refresh()">🔄 Refresh</button>
      </div>

      <!-- Real-time Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">⚡</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics?.changeDetectionCount || 0 }}</span>
            <span class="metric-label">Change Detection Cycles</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">⏱️</div>
          <div class="metric-content">
            <span class="metric-value" [class.slow]="isSlow(lastCdTime)">
              {{ lastCdTime | number:'1.2-2' }}ms
            </span>
            <span class="metric-label">Last CD Time</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">📈</div>
          <div class="metric-content">
            <span class="metric-value" [class.slow]="isSlow(avgCdTime)">
              {{ avgCdTime | number:'1.2-2' }}ms
            </span>
            <span class="metric-label">Average CD Time</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">🔄</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics?.componentCount || 0 }}</span>
            <span class="metric-label">Components</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">📌</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics?.directiveCount || 0 }}</span>
            <span class="metric-label">Directives</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">🔧</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics?.pipeCount || 0 }}</span>
            <span class="metric-label">Pipes</span>
          </div>
        </div>
      </div>

      <!-- Zone Status -->
      <div class="status-section">
        <h3>Zone.js Status</h3>
        <div class="status-cards">
          <div class="status-card" [class.stable]="metrics?.zoneStable">
            <div class="status-indicator" [class.stable]="metrics?.zoneStable"></div>
            <div class="status-content">
              <span class="status-label">Zone Stable</span>
              <span class="status-value">{{ metrics?.zoneStable ? 'Yes' : 'No' }}</span>
            </div>
          </div>

          <div class="status-card" [class.in-zone]="metrics?.ngZoneInZone">
            <div class="status-indicator" [class.in-zone]="metrics?.ngZoneInZone"></div>
            <div class="status-content">
              <span class="status-label">In Zone</span>
              <span class="status-value">{{ metrics?.ngZoneInZone ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CD History Chart -->
      <div class="chart-section">
        <h3>Change Detection History</h3>
        <div class="chart-container">
          <div class="chart-bars">
            @for (bar of cdHistory; track bar.index) {
              <div class="chart-bar-wrapper">
                <div
                  class="chart-bar"
                  [style.height.%]="bar.height"
                  [class.slow]="bar.slow">
                </div>
              </div>
            }
          </div>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-color fast"></span> Fast (&lt;16ms)
            </span>
            <span class="legend-item">
              <span class="legend-color slow"></span> Slow (&gt;16ms)
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <h3>Actions</h3>
        <div class="action-buttons">
          <button class="action-btn" (click)="triggerChangeDetection()">
            🔁 Trigger Change Detection
          </button>
          <button class="action-btn" (click)="resetMetrics()">
            🔄 Reset Metrics
          </button>
          <button class="action-btn" (click)="profileApplication()">
            📊 Profile Application
          </button>
          <button class="action-btn" (click)="exportMetrics()">
            📥 Export Metrics
          </button>
        </div>
      </div>

      <!-- Recommendations -->
      @if (recommendations.length > 0) {
        <div class="recommendations-section">
          <h3>💡 Recommendations</h3>
          <div class="recommendations-list">
            @for (rec of recommendations; track rec) {
              <div class="recommendation-item">
                <span class="rec-icon">{{ rec.icon }}</span>
                <span class="rec-text">{{ rec.text }}</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DevtoolsPerformanceComponent implements OnInit, OnDestroy {
  @Input() metrics: PerformanceMetrics | null = null;

  lastCdTime = 0;
  avgCdTime = 0;
  cdHistory: { index: number; height: number; slow: boolean }[] = [];
  recommendations: { icon: string; text: string }[] = [];

  private intervalId: any;

  constructor(private devtoolsService: DevtoolsService) {}

  ngOnInit(): void {
    this.updateMetrics();
    this.intervalId = setInterval(() => this.updateMetrics(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  refresh(): void {
    this.updateMetrics();
  }

  triggerChangeDetection(): void {
    this.devtoolsService.triggerChangeDetection();
  }

  resetMetrics(): void {
    // Reset would be handled by the service
    this.lastCdTime = 0;
    this.avgCdTime = 0;
    this.cdHistory = [];
  }

  profileApplication(): void {
    if ((window as any).performance?.getEntriesByType) {
      const entries = performance.getEntriesByType('navigation');
      console.log('Performance Navigation Timing:', entries);
    }
  }

  exportMetrics(): void {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      cdHistory: this.cdHistory,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  isSlow(time: number): boolean {
    return time > 16; // More than 1 frame at 60fps
  }

  private updateMetrics(): void {
    if (this.metrics) {
      this.lastCdTime = this.metrics.lastChangeDetectionTime || 0;
      this.avgCdTime = this.metrics.averageChangeDetectionTime;

      // Update chart history
      const height = Math.min(100, (this.lastCdTime / 50) * 100);
      this.cdHistory.push({
        index: this.cdHistory.length,
        height,
        slow: this.lastCdTime > 16,
      });

      // Keep only last 30 entries
      if (this.cdHistory.length > 30) {
        this.cdHistory.shift();
      }

      // Generate recommendations
      this.generateRecommendations();
    }
  }

  private generateRecommendations(): void {
    this.recommendations = [];

    if (this.avgCdTime > 16) {
      this.recommendations.push({
        icon: '⚠️',
        text: 'Average change detection time is high. Consider using OnPush change detection strategy.',
      });
    }

    if ((this.metrics?.changeDetectionCount || 0) > 100) {
      this.recommendations.push({
        icon: '🔄',
        text: 'High number of change detection cycles. Review event handlers and async operations.',
      });
    }

    if (!this.metrics?.zoneStable) {
      this.recommendations.push({
        icon: '🔍',
        text: 'Zone is not stable. Check for pending timers or unresolved promises.',
      });
    }

    if ((this.metrics?.componentCount || 0) > 50) {
      this.recommendations.push({
        icon: '📦',
        text: 'Large component tree. Consider lazy loading or virtual scrolling.',
      });
    }
  }
}
