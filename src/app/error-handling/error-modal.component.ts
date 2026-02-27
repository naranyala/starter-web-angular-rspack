import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ErrorStateService } from './error-state.service';
import './error-modal.component.css';

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
})
export class ErrorModalComponent {
  private errorStateService = inject(ErrorStateService, { optional: true });

  isModalOpen = signal(false);
  currentError = signal<any>(null);
  isCriticalError = computed(() => this.currentError()?.severity === 'critical');

  constructor() {
    if (this.errorStateService) {
      // Sync with error state service
      effect(() => {
        this.isModalOpen.set(this.errorStateService!.isModalOpen$());
      });
      effect(() => {
        this.currentError.set(this.errorStateService!.currentError$());
      });
    }
  }

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
