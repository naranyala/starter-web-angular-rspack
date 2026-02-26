import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ConsoleEntry {
  id: number;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: number;
  data?: unknown;
}

type FilterType = 'all' | 'log' | 'warn' | 'error' | 'info';

@Component({
  selector: 'app-devtools-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="console-container">
      <div class="console-header">
        <h2>Console</h2>
        <div class="header-actions">
          <div class="filter-buttons">
            <button
              class="filter-btn"
              [class.active]="filter() === 'all'"
              (click)="setFilter('all')">
              All
            </button>
            <button
              class="filter-btn log"
              [class.active]="filter() === 'log'"
              (click)="setFilter('log')">
              Log
            </button>
            <button
              class="filter-btn info"
              [class.active]="filter() === 'info'"
              (click)="setFilter('info')">
              Info
            </button>
            <button
              class="filter-btn warn"
              [class.active]="filter() === 'warn'"
              (click)="setFilter('warn')">
              Warn
            </button>
            <button
              class="filter-btn error"
              [class.active]="filter() === 'error'"
              (click)="setFilter('error')">
              Error
            </button>
          </div>
          <input
            type="text"
            class="search-input"
            placeholder="Filter messages..."
            [(ngModel)]="searchQuery"
          />
          <button class="clear-btn" (click)="clearConsole()">🗑️ Clear</button>
        </div>
      </div>

      <!-- Console Output -->
      <div class="console-output" #output>
        @if (filteredLogs.length > 0) {
          @for (entry of filteredLogs; track entry.id) {
            <div class="console-entry" [class]="entry.type">
              <span class="entry-time">{{ formatTime(entry.timestamp) }}</span>
              <span class="entry-type">{{ entry.type }}</span>
              <span class="entry-message">{{ entry.message }}</span>
              @if (entry.data) {
                <button class="expand-btn" (click)="toggleEntry(entry.id)">
                  {{ expandedEntries.has(entry.id) ? '▼' : '▶' }}
                </button>
              }
            </div>
            @if (expandedEntries.has(entry.id) && entry.data) {
              <div class="entry-data">
                <pre>{{ formatData(entry.data) }}</pre>
              </div>
            }
          }
        } @else {
          <div class="empty-state">
            <span class="empty-icon">💬</span>
            <p>Console is empty</p>
            <span class="empty-hint">Console messages will appear here</span>
          </div>
        }
      </div>

      <!-- Console Input -->
      <div class="console-input-container">
        <span class="input-prompt">></span>
        <input
          type="text"
          class="console-input"
          placeholder="Evaluate JavaScript..."
          [(ngModel)]="commandInput"
          (keydown.enter)="executeCommand()"
          [disabled]="true"
          title="Command execution requires additional setup"
        />
        <span class="input-hint">⏎ to execute (disabled)</span>
      </div>
    </div>
  `,
  styles: [
    `
    .console-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #333;
      flex-wrap: wrap;
      gap: 12px;
    }

    .console-header h2 {
      color: #fff;
      font-size: 18px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-buttons {
      display: flex;
      gap: 4px;
    }

    .filter-btn {
      padding: 4px 10px;
      background: #2d2d30;
      border: 1px solid #333;
      border-radius: 4px;
      color: #858585;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .filter-btn:hover {
      background: #3d3d3d;
    }

    .filter-btn.active {
      color: #fff;
      border-color: currentColor;
    }

    .filter-btn.log.active { background: #4caf50; border-color: #4caf50; }
    .filter-btn.info.active { background: #2196f3; border-color: #2196f3; }
    .filter-btn.warn.active { background: #ff9800; border-color: #ff9800; }
    .filter-btn.error.active { background: #f44336; border-color: #f44336; }

    .search-input {
      padding: 4px 10px;
      background: #2d2d30;
      border: 1px solid #333;
      border-radius: 4px;
      color: #fff;
      font-size: 12px;
      width: 150px;
    }

    .search-input:focus {
      outline: none;
      border-color: #007acc;
    }

    .clear-btn {
      padding: 4px 10px;
      background: transparent;
      border: 1px solid #f44336;
      border-radius: 4px;
      color: #f44336;
      font-size: 12px;
      cursor: pointer;
    }

    .clear-btn:hover {
      background: #f44336;
      color: #fff;
    }

    .console-output {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
    }

    .console-entry {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-bottom: 1px solid #333;
    }

    .console-entry:hover {
      background: #252526;
    }

    .console-entry.log { border-left: 3px solid #4caf50; }
    .console-entry.info { border-left: 3px solid #2196f3; }
    .console-entry.warn {
      border-left: 3px solid #ff9800;
      background: rgba(255, 152, 0, 0.1);
    }
    .console-entry.error {
      border-left: 3px solid #f44336;
      background: rgba(244, 67, 54, 0.1);
    }

    .entry-time {
      color: #858585;
      font-size: 10px;
      min-width: 70px;
    }

    .entry-type {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
      min-width: 40px;
      text-align: center;
    }

    .entry-type.log { background: #4caf50; color: #fff; }
    .entry-type.info { background: #2196f3; color: #fff; }
    .entry-type.warn { background: #ff9800; color: #fff; }
    .entry-type.error { background: #f44336; color: #fff; }

    .entry-message {
      flex: 1;
      color: #d4d4d4;
      word-break: break-word;
    }

    .expand-btn {
      padding: 2px 6px;
      background: transparent;
      border: none;
      color: #858585;
      cursor: pointer;
      font-size: 10px;
    }

    .expand-btn:hover {
      color: #fff;
    }

    .entry-data {
      padding: 8px 8px 8px 36px;
      background: #1e1e1e;
      border-bottom: 1px solid #333;
    }

    .entry-data pre {
      margin: 0;
      color: #ce9178;
      white-space: pre-wrap;
      word-break: break-all;
      font-size: 11px;
    }

    .console-input-container {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #252526;
      border-top: 1px solid #333;
    }

    .input-prompt {
      color: #4caf50;
      font-weight: 600;
      font-family: 'Consolas', 'Monaco', monospace;
    }

    .console-input {
      flex: 1;
      padding: 6px 10px;
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 4px;
      color: #fff;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
    }

    .console-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .console-input:focus {
      outline: none;
      border-color: #007acc;
    }

    .input-hint {
      color: #858585;
      font-size: 11px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #858585;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state p {
      font-size: 16px;
      margin: 0 0 8px;
    }

    .empty-hint {
      font-size: 12px;
      opacity: 0.7;
    }
  `,
  ],
})
export class DevtoolsConsoleComponent {
  @Input() logs: ConsoleEntry[] = [];
  filter = signal<FilterType>('all');
  searchQuery = signal('');
  commandInput = signal('');
  expandedEntries = new Set<number>();

  get filteredLogs(): ConsoleEntry[] {
    let result = this.logs;

    // Filter by type
    const filterValue = this.filter();
    if (filterValue !== 'all') {
      result = result.filter((log) => log.type === filterValue);
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter((log) => log.message.toLowerCase().includes(query));
    }

    return result;
  }

  setFilter(type: FilterType): void {
    this.filter.set(type);
  }

  clearConsole(): void {
    console.clear();
  }

  toggleEntry(id: number): void {
    if (this.expandedEntries.has(id)) {
      this.expandedEntries.delete(id);
    } else {
      this.expandedEntries.add(id);
    }
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return (
      date.toLocaleTimeString('en-US', { hour12: false }) +
      '.' +
      String(date.getMilliseconds()).padStart(3, '0')
    );
  }

  formatData(data: unknown): string {
    try {
      if (typeof data === 'object' && data !== null) {
        return JSON.stringify(data, null, 2);
      }
      return String(data);
    } catch {
      return '[Circular Reference]';
    }
  }

  executeCommand(): void {
    // Command execution is disabled for security reasons
    // In a production devtools, this would use a sandboxed evaluation
    const cmd = this.commandInput();
    if (cmd) {
      console.log(`Command execution disabled: ${cmd}`);
      this.commandInput.set('');
    }
  }
}
