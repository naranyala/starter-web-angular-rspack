import { CommonModule } from '@angular/common';
import { Component, computed, inject, type OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getThemeMode, initTheme, type ThemeMode, toggleTheme } from './theme';
import { type WinBoxWindow, WinBoxWindowService } from './winbox-window.service';
import './winbox-panel.component.css';

@Component({
  selector: 'app-winbox-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="winbox-panel-container">
      <!-- Top Row: App Title and Actions -->
      <div class="winbox-panel-header">
        <div class="app-title">
          <span class="app-icon">🪟</span>
          <span class="app-name">starter-web-angular-rspack</span>
        </div>
        <div class="header-actions">
          <!-- Theme Toggle -->
          <button class="theme-toggle" (click)="toggleTheme()" [title]="themeMode() === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            @if (themeMode() === 'dark') {
              <span class="theme-icon">☀️</span>
            } @else {
              <span class="theme-icon">🌙</span>
            }
          </button>
          @if (windowCount() > 0) {
            <button class="header-action-button" (click)="closeAll()" title="Close All Windows">
              × Close All
            </button>
            <span class="window-count-badge">{{ windowCount() }} window{{ windowCount() > 1 ? 's' : '' }}</span>
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
export class WinBoxPanelComponent implements OnInit {
  private windowService = inject(WinBoxWindowService);

  windows = computed(() => this.windowService.windowsList());
  windowCount = computed(() => this.windowService.windowsList().length);
  hasWindows = computed(() => this.windowService.hasWindows());
  hasMinimized = computed(() => this.windowService.hasMinimized());
  allHidden = computed(() => this.windowService.areAllHidden());

  themeMode = signal<ThemeMode>('dark');

  ngOnInit(): void {
    // Initialize theme early - defaults to dark
    initTheme();
    this.themeMode.set(getThemeMode());
  }

  toggleTheme(): void {
    const newMode = toggleTheme();
    this.themeMode.set(newMode);
  }

  onHomeClick(event: Event): void {
    event.stopPropagation();
    this.windowService.hideAll();
  }

  onTabClick(win: WinBoxWindow): void {
    if (win.minimized) {
      this.windowService.restoreWindow(win.id);
    }
    this.windowService.setActiveWindow(win.id);
  }

  closeAll(): void {
    this.windowService.closeAll();
  }
}
