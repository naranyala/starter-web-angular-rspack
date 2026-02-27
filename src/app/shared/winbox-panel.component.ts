import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WinBoxWindowService, type WinBoxWindow } from './winbox-window.service';
import './winbox-panel.component.css';

@Component({
  selector: 'app-winbox-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="winbox-panel-container">
      <!-- Top Row: App Title and Count -->
      <div class="winbox-panel-header">
        <div class="app-title">
          <span class="app-icon">🪟</span>
          <span class="app-name">Window Manager</span>
          @if (windowCount() > 0) {
            <span class="window-count-badge">{{ windowCount() }} window{{ windowCount() > 1 ? 's' : '' }}</span>
          }
        </div>
        <div class="header-actions">
          @if (hasMinimized()) {
            <button class="header-action-button" (click)="restoreAll()" title="Restore All">
              ⬆ All
            </button>
          }
          @if (windowCount() > 0) {
            <button class="header-action-button" (click)="minimizeAll()" title="Minimize All">
              ⬇ All
            </button>
          }
        </div>
      </div>

      <!-- Bottom Row: Window Tabs -->
      <div class="winbox-tabs">
        <!-- Home Button (always first, cannot be closed) -->
        <div class="home-tab" (click)="onHomeClick($event)" [class.all-hidden]="allHidden()">
          <span class="home-icon">🏠</span>
          <span class="home-text">Home</span>
          @if (hasWindows() && !allHidden()) {
            <span class="window-indicator">{{ windowCount() }}</span>
          }
        </div>

        @for (win of windows(); track win.id) {
          <div
            class="winbox-tab"
            [class.active]="win.active"
            [class.minimized]="win.minimized"
            [style.border-top-color]="win.color"
            (click)="onTabClick(win)">
            @if (win.color) {
              <span class="tab-color-dot" [style.background]="win.color"></span>
            }
            <span class="tab-title">{{ win.title }}</span>
          </div>
        } @empty {
          <div class="no-windows">
            <span class="no-windows-icon">🪟</span>
            <span class="no-windows-text">No windows open</span>
          </div>
        }

        <div class="tab-spacer"></div>
      </div>
    </div>
  `,
})
export class WinBoxPanelComponent {
  private windowService = inject(WinBoxWindowService);

  windows = computed(() => this.windowService.windowsList());
  windowCount = computed(() => this.windowService.windowsList().length);
  minimizedCount = computed(() =>
    this.windowService.windowsList().filter((w) => w.minimized).length
  );
  hasMinimized = computed(() => this.windowService.hasMinimized());
  activeWindow = computed(() => this.windowService.activeWindow());
  hasWindows = computed(() => this.windowService.hasWindows());
  allHidden = computed(() => this.windowService.areAllHidden());

  onHomeClick(event: Event): void {
    event.stopPropagation();
    // Just hide all visible windows, don't navigate
    this.windowService.hideAll();
  }

  onTabClick(win: WinBoxWindow): void {
    if (win.minimized) {
      this.windowService.restoreWindow(win.id);
    }
    this.windowService.setActiveWindow(win.id);
  }

  minimizeAll(): void {
    this.windowService.minimizeAll();
  }

  restoreAll(): void {
    this.windowService.restoreAll();
  }
}
