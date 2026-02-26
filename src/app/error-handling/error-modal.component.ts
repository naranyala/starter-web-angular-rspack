import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ErrorStateService } from './error-state.service';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isModalOpen()) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal-container" [class.severity-critical]="isCriticalError()">
          <div class="modal-header">
            <div class="header-left">
              <span class="error-icon">{{ getErrorIcon() }}</span>
              <div>
                <h2 class="modal-title">{{ isCriticalError() ? 'Critical Error' : 'Application Error' }}</h2>
                <span class="error-type-badge" [class]="currentError()?.type">{{ currentError()?.type }}</span>
              </div>
            </div>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <div class="modal-body">
            <div class="error-message-section">
              <label class="section-label">Error Message</label>
              <div class="error-message">{{ currentError()?.message }}</div>
            </div>

            <div class="error-details-grid">
              <div class="detail-item">
                <span class="detail-label">Time:</span>
                <span class="detail-value">{{ formatTimestamp(currentError()?.timestamp) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Type:</span>
                <span class="detail-value">{{ currentError()?.type }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Severity:</span>
                <span class="detail-value severity" [class]="currentError()?.severity">{{ currentError()?.severity }}</span>
              </div>
            </div>

            @if (currentError()?.stack) {
              <div class="stack-trace-section">
                <label class="section-label">Stack Trace</label>
                <pre class="stack-trace">{{ currentError()?.stack }}</pre>
              </div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" (click)="reloadPage()">🔄 Reload</button>
            <button class="btn btn-success" (click)="closeModal()">Continue</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    }
    .modal-container {
      background: #1e1e1e;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      max-width: 700px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      border: 1px solid #333;
    }
    .modal-container.severity-critical {
      border-color: #f44336;
      box-shadow: 0 20px 60px rgba(244, 67, 54, 0.3);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #333;
      background: #252526;
      border-radius: 12px 12px 0 0;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .error-icon { font-size: 32px; }
    .modal-title {
      color: #fff;
      font-size: 18px;
      margin: 0 0 8px;
    }
    .error-type-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      background: #424242;
      color: #fff;
    }
    .error-type-badge.angular { background: #e535ab; }
    .error-type-badge.javascript { background: #f5a623; }
    .error-type-badge.network { background: #2196f3; }
    .close-btn {
      background: transparent;
      border: none;
      color: #858585;
      font-size: 24px;
      cursor: pointer;
      padding: 4px;
    }
    .close-btn:hover { background: #f44336; color: #fff; }
    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
    .error-message-section { margin-bottom: 20px; }
    .section-label {
      display: block;
      color: #858585;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .error-message {
      background: #2d2d30;
      border: 1px solid #333;
      border-left: 4px solid #f44336;
      color: #f44336;
      padding: 16px;
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.6;
    }
    .error-details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
      background: #252526;
      padding: 16px;
      border-radius: 8px;
    }
    .detail-item { display: flex; flex-direction: column; gap: 4px; }
    .detail-label { color: #858585; font-size: 11px; text-transform: uppercase; }
    .detail-value { color: #fff; font-size: 13px; font-weight: 500; }
    .detail-value.severity {
      text-transform: capitalize;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    .detail-value.severity.critical { background: #f44336; }
    .detail-value.severity.error { background: #ff9800; }
    .detail-value.severity.warning { background: #ffc107; color: #000; }
    .stack-trace-section { margin-top: 20px; }
    .stack-trace {
      background: #0d0d0d;
      color: #ce9178;
      padding: 16px;
      border-radius: 6px;
      font-size: 11px;
      font-family: 'Consolas', monospace;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 200px;
      overflow-y: auto;
      margin: 0;
      border: 1px solid #333;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid #333;
      background: #252526;
      border-radius: 0 0 12px 12px;
    }
    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-primary { background: #007acc; color: #fff; }
    .btn-primary:hover { background: #005fa3; }
    .btn-success { background: #4caf50; color: #fff; }
    .btn-success:hover { background: #388e3c; }
  `],
})
export class ErrorModalComponent {
  private errorStateService = inject(ErrorStateService, { optional: true });

  isModalOpen = this.errorStateService?.isModalOpen$ ?? signal(false);
  currentError = this.errorStateService?.currentError$ ?? signal<any>(null);
  isCriticalError = computed(() => this.currentError()?.severity === 'critical');

  getErrorIcon(): string {
    const severity = this.currentError()?.severity;
    if (severity === 'critical') return '🚨';
    if (severity === 'warning') return '⚠️';
    return '❌';
  }

  formatTimestamp(timestamp?: Date): string {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  }

  closeModal(): void {
    this.errorStateService?.closeModal();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  reloadPage(): void {
    window.location.reload();
  }
}
