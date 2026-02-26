import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  styles: [
    `
    .settings-container {
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }

    .settings-header {
      margin-bottom: 24px;
    }

    .settings-header h2 {
      color: #fff;
      font-size: 18px;
      margin: 0;
    }

    .settings-section {
      margin-bottom: 24px;
    }

    .settings-section h3 {
      color: #858585;
      font-size: 12px;
      margin: 0 0 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #333;
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      flex: 1;
    }

    .setting-label {
      display: block;
      color: #fff;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .setting-description {
      display: block;
      color: #858585;
      font-size: 11px;
    }

    .setting-control {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .height-slider {
      width: 150px;
      accent-color: #007acc;
    }

    .height-value {
      color: #007acc;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      min-width: 50px;
      text-align: right;
    }

    .shortcut-key {
      display: inline-block;
      padding: 4px 8px;
      background: #2d2d30;
      border: 1px solid #333;
      border-radius: 4px;
      color: #fff;
      font-size: 11px;
      font-family: inherit;
    }

    /* Toggle Switch */
    .toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }

    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #333;
      transition: 0.3s;
      border-radius: 24px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: #fff;
      transition: 0.3s;
      border-radius: 50%;
    }

    .toggle input:checked + .toggle-slider {
      background-color: #007acc;
    }

    .toggle input:checked + .toggle-slider:before {
      transform: translateX(20px);
    }

    /* Select Input */
    .select-input {
      padding: 6px 10px;
      background: #2d2d30;
      border: 1px solid #333;
      border-radius: 4px;
      color: #fff;
      font-size: 12px;
      cursor: pointer;
    }

    .select-input:focus {
      outline: none;
      border-color: #007acc;
    }

    /* About Card */
    .about-card {
      background: #252526;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #333;
    }

    .about-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .about-icon {
      font-size: 32px;
    }

    .about-header h4 {
      color: #fff;
      font-size: 16px;
      margin: 0;
    }

    .about-version {
      color: #858585;
      font-size: 11px;
    }

    .about-description {
      color: #d4d4d4;
      font-size: 13px;
      line-height: 1.6;
      margin: 0 0 12px;
    }

    .about-links {
      display: flex;
      gap: 12px;
    }

    .about-link {
      color: #007acc;
      font-size: 12px;
      text-decoration: none;
    }

    .about-link:hover {
      text-decoration: underline;
    }

    /* Danger Zone */
    .danger-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #333;
    }

    .danger-item:last-child {
      border-bottom: none;
    }

    .reset-btn {
      padding: 8px 16px;
      background: #ff9800;
      border: none;
      border-radius: 4px;
      color: #fff;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .reset-btn:hover {
      background: #f57c00;
    }

    .clear-btn {
      padding: 8px 16px;
      background: #f44336;
      border: none;
      border-radius: 4px;
      color: #fff;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .clear-btn:hover {
      background: #d32f2f;
    }
  `,
  ],
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
