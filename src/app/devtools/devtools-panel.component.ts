import { CommonModule } from '@angular/common';
import { Component, type OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevtoolsComponentsComponent } from './components/devtools-components.component';
import { DevtoolsConsoleComponent } from './console/devtools-console.component';
import { DevtoolsService, type DevtoolsComponentInfo } from './devtools.service';
import { HttpTrackingService } from './http-tracking.interceptor';
import { DevtoolsNetworkComponent } from './network/devtools-network.component';
import { DevtoolsOverviewComponent } from './overview/devtools-overview.component';
import { DevtoolsPerformanceComponent } from './performance/devtools-performance.component';
import { DevtoolsRoutingComponent } from './routing/devtools-routing.component';
import { DevtoolsSettingsComponent } from './settings/devtools-settings.component';

type DevtoolsTab =
  | 'overview'
  | 'components'
  | 'routing'
  | 'network'
  | 'performance'
  | 'console'
  | 'settings';

interface ConsoleEntry {
  id: number;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: number;
  data?: unknown;
}

@Component({
  selector: 'app-devtools',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DevtoolsOverviewComponent,
    DevtoolsComponentsComponent,
    DevtoolsRoutingComponent,
    DevtoolsNetworkComponent,
    DevtoolsPerformanceComponent,
    DevtoolsConsoleComponent,
    DevtoolsSettingsComponent,
  ],
  template: `
    <div class="devtools-container" [class.collapsed]="collapsed()" [class.expanded]="!collapsed()">
      <!-- Toggle Bar -->
      <div class="devtools-toggle" (click)="toggleCollapsed()">
        <span class="toggle-icon">{{ collapsed() ? '🔧' : '▼' }}</span>
        <span class="toggle-text">{{ collapsed() ? 'DevTools' : '' }}</span>
        <span class="shortcut-hint" *ngIf="!collapsed()">Ctrl+Shift+D</span>
      </div>

      <!-- Main Panel -->
      <div class="devtools-panel" *ngIf="!collapsed()">
        <!-- Tab Bar -->
        <div class="devtools-tabs">
          @for (tab of tabs; track tab.id) {
            <button
              class="tab-button"
              [class.active]="activeTab() === tab.id"
              (click)="setActiveTab(tab.id)"
              [title]="tab.label">
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-label" *ngIf="!narrowView()">{{ tab.label }}</span>
              @if (tab.badge) {
                <span class="tab-badge">{{ tab.badge() }}</span>
              }
            </button>
          }
          <div class="tab-spacer"></div>
          <button class="close-button" (click)="toggleCollapsed()" title="Close (Ctrl+Shift+D)">✕</button>
        </div>

        <!-- Tab Content -->
        <div class="devtools-content">
          <!-- Overview Tab -->
          @if (activeTab() === 'overview') {
            <app-devtools-overview
              [buildInfo]="buildInfo"
              [componentCount]="componentCount()"
              [serviceCount]="serviceCount()">
            </app-devtools-overview>
          }

          <!-- Components Tab -->
          @if (activeTab() === 'components') {
            <app-devtools-components [componentTree]="componentTree()"></app-devtools-components>
          }

          <!-- Routing Tab -->
          @if (activeTab() === 'routing') {
            <app-devtools-routing
              [currentRoute]="currentRoute()"
              [navigationHistory]="navigationHistory()">
            </app-devtools-routing>
          }

          <!-- Network Tab -->
          @if (activeTab() === 'network') {
            <app-devtools-network [httpLogs]="httpLogs()"></app-devtools-network>
          }

          <!-- Performance Tab -->
          @if (activeTab() === 'performance') {
            <app-devtools-performance [metrics]="performanceMetrics()"></app-devtools-performance>
          }

          <!-- Console Tab -->
          @if (activeTab() === 'console') {
            <app-devtools-console [logs]="consoleLogs()"></app-devtools-console>
          }

          <!-- Settings Tab -->
          @if (activeTab() === 'settings') {
            <app-devtools-settings
              [panelHeight]="panelHeight"
              (panelHeightChange)="onPanelHeightChange($event)">
            </app-devtools-settings>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .devtools-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      transition: transform 0.2s ease;
    }

    .devtools-container.collapsed {
      transform: translateY(calc(100% - 40px));
    }

    .devtools-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 16px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      cursor: pointer;
      user-select: none;
      border-top: 1px solid #333;
    }

    .devtools-toggle:hover {
      background: linear-gradient(135deg, #1f1f3a 0%, #1a2744 100%);
    }

    .toggle-icon {
      font-size: 18px;
    }

    .toggle-text {
      font-weight: 600;
      font-size: 14px;
    }

    .shortcut-hint {
      margin-left: auto;
      font-size: 11px;
      opacity: 0.6;
      background: rgba(255,255,255,0.1);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .devtools-panel {
      display: flex;
      flex-direction: column;
      height: var(--devtools-height, 400px);
      background: #1e1e1e;
      border-top: 2px solid #0f3460;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
    }

    .devtools-tabs {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px 0;
      background: #252526;
      border-bottom: 1px solid #333;
      overflow-x: auto;
    }

    .tab-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: transparent;
      border: none;
      color: #858585;
      font-size: 13px;
      cursor: pointer;
      border-radius: 6px 6px 0 0;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .tab-button:hover {
      background: #2d2d30;
      color: #fff;
    }

    .tab-button.active {
      background: #1e1e1e;
      color: #007acc;
      border-bottom: 2px solid #007acc;
    }

    .tab-icon {
      font-size: 14px;
    }

    .tab-badge {
      background: #e535ab;
      color: #fff;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .tab-spacer {
      flex: 1;
    }

    .close-button {
      padding: 6px 12px;
      background: transparent;
      border: none;
      color: #858585;
      font-size: 18px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.15s ease;
    }

    .close-button:hover {
      background: #f44336;
      color: #fff;
    }

    .devtools-content {
      flex: 1;
      overflow: auto;
      background: #1e1e1e;
    }

    /* Scrollbar styling */
    .devtools-content::-webkit-scrollbar,
    .devtools-tabs::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    .devtools-content::-webkit-scrollbar-track,
    .devtools-tabs::-webkit-scrollbar-track {
      background: #252526;
    }

    .devtools-content::-webkit-scrollbar-thumb,
    .devtools-tabs::-webkit-scrollbar-thumb {
      background: #424242;
      border-radius: 5px;
    }

    .devtools-content::-webkit-scrollbar-thumb:hover,
    .devtools-tabs::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `,
  ],
})
export class DevtoolsPanelComponent implements OnInit {
  readonly tabs: { id: DevtoolsTab; label: string; icon: string; badge?: any }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'components', label: 'Components', icon: '🧩' },
    { id: 'routing', label: 'Routing', icon: '🔗' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'console', label: 'Console', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  collapsed = signal(true);
  activeTab = signal<DevtoolsTab>('overview');
  panelHeight = 400;
  narrowView = signal(false);

  // Data signals
  buildInfo: any = null;
  componentTree = signal<DevtoolsComponentInfo[]>([]);
  componentCount = signal(0);
  serviceCount = signal(0);
  currentRoute = signal<any>(null);
  navigationHistory = signal<any[]>([]);
  httpLogs = signal<any[]>([]);
  performanceMetrics = signal<any>({
    changeDetectionCount: 0,
    lastChangeDetectionTime: 0,
    averageChangeDetectionTime: 0,
    componentCount: 0,
    directiveCount: 0,
    pipeCount: 0,
    zoneStable: true,
    ngZoneInZone: false,
  });
  consoleLogs = signal<ConsoleEntry[]>([]);

  private consoleLogId = 1;

  constructor(
    private devtoolsService: DevtoolsService,
    private httpTrackingService: HttpTrackingService
  ) {
    // Setup console interception
    this.setupConsoleInterception();
  }

  ngOnInit(): void {
    this.loadOverviewData();
    this.loadComponentData();
    this.loadRoutingData();
    this.loadNetworkData();
    this.loadPerformanceData();

    // Setup resize observer for narrow view detection
    this.checkNarrowView();
    window.addEventListener('resize', () => this.checkNarrowView());

    // Setup keyboard shortcut
    this.setupKeyboardShortcut();
  }

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
    if (!this.collapsed()) {
      this.refreshAllData();
    }
  }

  setActiveTab(tab: DevtoolsTab): void {
    this.activeTab.set(tab);
    this.refreshTabData(tab);
  }

  onPanelHeightChange(height: number): void {
    this.panelHeight = height;
    document.documentElement.style.setProperty('--devtools-height', `${height}px`);
  }

  private checkNarrowView(): void {
    this.narrowView.set(window.innerWidth < 768);
  }

  private setupKeyboardShortcut(): void {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggleCollapsed();
      }
    });
  }

  private setupConsoleInterception(): void {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (type: ConsoleEntry['type'], args: any[]) => {
      const message = args.map((arg) => this.stringify(arg)).join(' ');
      this.consoleLogs.update((logs) =>
        [
          {
            id: this.consoleLogId++,
            type,
            message,
            timestamp: Date.now(),
            data: args.length > 1 ? args : undefined,
          },
          ...logs,
        ].slice(0, 500)
      );
    };

    console.log = (...args) => {
      addLog('log', args);
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      addLog('warn', args);
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      addLog('error', args);
      originalError.apply(console, args);
    };

    console.info = (...args) => {
      addLog('info', args);
      originalInfo.apply(console, args);
    };
  }

  private stringify(value: any): string {
    try {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    } catch {
      return '[Circular]';
    }
  }

  private loadOverviewData(): void {
    this.buildInfo = this.devtoolsService.getBuildInfo();
  }

  private loadComponentData(): void {
    setTimeout(() => {
      const tree = this.devtoolsService.getComponentTree();
      this.componentTree.set(tree);
      this.componentCount.set(this.countComponents(tree));
    }, 500);
  }

  private countComponents(tree: DevtoolsComponentInfo[]): number {
    let count = tree.length;
    for (const component of tree) {
      count += this.countComponents(component.children);
    }
    return count;
  }

  private loadRoutingData(): void {
    this.currentRoute.set(this.devtoolsService.currentRoute$());
    this.navigationHistory.set(this.devtoolsService.getNavigationHistory());
  }

  private loadNetworkData(): void {
    this.httpLogs.set(this.httpTrackingService.getLogs());
  }

  private loadPerformanceData(): void {
    this.performanceMetrics.set(this.devtoolsService.getPerformanceMetrics());
  }

  private refreshAllData(): void {
    this.loadOverviewData();
    this.loadComponentData();
    this.loadRoutingData();
    this.loadNetworkData();
    this.loadPerformanceData();
  }

  private refreshTabData(tab: DevtoolsTab): void {
    switch (tab) {
      case 'overview':
        this.loadOverviewData();
        break;
      case 'components':
        this.loadComponentData();
        break;
      case 'routing':
        this.loadRoutingData();
        break;
      case 'network':
        this.loadNetworkData();
        break;
      case 'performance':
        this.loadPerformanceData();
        break;
    }
  }
}
