import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import './devtools-settings.component.css';

@Component({
  selector: 'app-devtools-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <h2>DevTools Settings</h2>
      </div>

      <!-- Panel Settings -->
      <div class="settings-section">
        <h3>Panel</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Panel Height</span>
            <span class="setting-description">Adjust the height of the devtools panel</span>
          </div>
          <div class="setting-control">
            <input
              type="range"
              class="height-slider"
              min="200"
              max="600"
              step="50"
              [ngModel]="panelHeightSig()"
              (ngModelChange)="onHeightChange($event)"
            />
            <span class="height-value">{{ panelHeightSig() }}px</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Keyboard Shortcut</span>
            <span class="setting-description">Toggle devtools with keyboard</span>
          </div>
          <div class="setting-control">
            <kbd class="shortcut-key">Ctrl</kbd>
            <span>+</span>
            <kbd class="shortcut-key">Shift</kbd>
            <span>+</span>
            <kbd class="shortcut-key">D</kbd>
          </div>
        </div>
      </div>

      <!-- Display Settings -->
      <div class="settings-section">
        <h3>Display</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Show Component Inputs</span>
            <span class="setting-description">Display component input values in the tree</span>
          </div>
          <label class="toggle">
            <input type="checkbox" [ngModel]="showInputs()" (ngModelChange)="showInputs.set($event)" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Show Timestamps</span>
            <span class="setting-description">Display timestamps in console and network logs</span>
          </div>
          <label class="toggle">
            <input type="checkbox" [ngModel]="showTimestamps()" (ngModelChange)="showTimestamps.set($event)" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Compact Mode</span>
            <span class="setting-description">Use compact layout for smaller screens</span>
          </div>
          <label class="toggle">
            <input type="checkbox" [ngModel]="compactMode()" (ngModelChange)="compactMode.set($event)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- Data Settings -->
      <div class="settings-section">
        <h3>Data</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Max Console Entries</span>
            <span class="setting-description">Maximum number of console entries to keep</span>
          </div>
          <div class="setting-control">
            <select class="select-input" [ngModel]="maxConsoleEntries()" (ngModelChange)="maxConsoleEntries.set($event)">
              <option [ngValue]="100">100</option>
              <option [ngValue]="250">250</option>
              <option [ngValue]="500">500</option>
              <option [ngValue]="1000">1000</option>
            </select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Max Network Logs</span>
            <span class="setting-description">Maximum number of network logs to keep</span>
          </div>
          <div class="setting-control">
            <select class="select-input" [ngModel]="maxNetworkLogs()" (ngModelChange)="maxNetworkLogs.set($event)">
              <option [ngValue]="50">50</option>
              <option [ngValue]="100">100</option>
              <option [ngValue]="200">200</option>
            </select>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="settings-section">
        <h3>About</h3>
        <div class="about-card">
          <div class="about-header">
            <span class="about-icon">🔧</span>
            <div>
              <h4>Angular DevTools</h4>
              <span class="about-version">Version 1.0.0</span>
            </div>
          </div>
          <p class="about-description">
            A comprehensive developer tools panel for Angular applications.
            Inspect components, monitor performance, track network requests, and debug your application.
          </p>
          <div class="about-links">
            <a href="#" class="about-link">Documentation</a>
            <a href="#" class="about-link">GitHub</a>
            <a href="#" class="about-link">Report Issue</a>
          </div>
        </div>
      </div>

      <!-- Reset Settings -->
      <div class="settings-section">
        <h3>Danger Zone</h3>
        <div class="danger-item">
          <div class="setting-info">
            <span class="setting-label">Reset All Settings</span>
            <span class="setting-description">Reset all settings to their default values</span>
          </div>
          <button class="reset-btn" (click)="resetSettings()">Reset Settings</button>
        </div>
        <div class="danger-item">
          <div class="setting-info">
            <span class="setting-label">Clear All Data</span>
            <span class="setting-description">Clear all logs, console entries, and cached data</span>
          </div>
          <button class="clear-btn" (click)="clearAllData()">Clear All Data</button>
        </div>
      </div>
    </div>
  `,
})
export class DevtoolsSettingsComponent {
  @Input() panelHeight = 400;
  @Output() panelHeightChange = new EventEmitter<number>();

  panelHeightSig = signal(400);
  showInputs = signal(true);
  showTimestamps = signal(true);
  compactMode = signal(false);
  maxConsoleEntries = signal(500);
  maxNetworkLogs = signal(100);

  constructor() {
    this.panelHeightSig.set(this.panelHeight);
  }

  onHeightChange(value: number): void {
    this.panelHeightSig.set(value);
    this.panelHeightChange.emit(value);
  }

  resetSettings(): void {
    this.panelHeightSig.set(400);
    this.showInputs.set(true);
    this.showTimestamps.set(true);
    this.compactMode.set(false);
    this.maxConsoleEntries.set(500);
    this.maxNetworkLogs.set(100);
    this.panelHeightChange.emit(400);
  }

  clearAllData(): void {
    console.clear();
    localStorage.clear();
    alert('All data cleared! (Note: Some data may persist in services)');
  }
}
