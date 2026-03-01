import { CommonModule } from '@angular/common';
import { Component, signal, computed, effect, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

type TabId = 'info' | 'routes' | 'components' | 'state' | 'events' | 'console' | 'network' | 'storage' | 'performance' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  badge?: number;
}

interface InfoItem {
  label: string;
  value: string;
  category?: 'app' | 'build' | 'runtime' | 'browser';
}

interface LogEntry {
  timestamp: string;
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  source?: string;
}

interface RouteInfo {
  path: string;
  url: string;
  timestamp: string;
}

interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  timestamp: string;
  type: 'fetch' | 'xhr' | 'websocket';
}

interface StorageItem {
  key: string;
  value: string;
  type: 'local' | 'session';
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  category: 'timing' | 'memory' | 'resource';
}

@Component({
  selector: 'app-devtools',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devtools.component.html',
  styleUrls: ['./devtools.component.css'],
})
export class DevtoolsComponent {
  readonly COLLAPSED_HEIGHT = 40;
  readonly EXPANDED_HEIGHT = 450;

  private router = inject(Router);

  readonly tabs = signal<Tab[]>([
    { id: 'info', label: 'Info' },
    { id: 'routes', label: 'Routes' },
    { id: 'components', label: 'Components' },
    { id: 'state', label: 'State' },
    { id: 'events', label: 'Events' },
    { id: 'console', label: 'Console', badge: 0 },
    { id: 'network', label: 'Network' },
    { id: 'storage', label: 'Storage' },
    { id: 'performance', label: 'Performance' },
    { id: 'settings', label: 'Settings' },
  ]);

  readonly activeTab = signal<TabId>('info');
  readonly isExpanded = signal<boolean>(false);
  readonly startTime = signal<Date>(new Date());

  // Info data
  readonly appInfo = signal<InfoItem[]>([
    { label: 'App Name', value: 'angular-rspack-demo', category: 'app' },
    { label: 'App Version', value: '0.0.0', category: 'app' },
    { label: 'Angular Version', value: '19.2.0', category: 'app' },
    { label: 'Build Tool', value: 'Rspack 1.3.5', category: 'build' },
    { label: 'Runtime', value: 'Bun', category: 'runtime' },
    { label: 'TypeScript', value: '5.5.0', category: 'build' },
    { label: 'Node Version', value: typeof process !== 'undefined' ? process.version : 'N/A', category: 'runtime' },
    { label: 'User Agent', value: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A', category: 'browser' },
    { label: 'Screen Resolution', value: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'N/A', category: 'browser' },
    { label: 'Viewport', value: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A', category: 'browser' },
    { label: 'Language', value: typeof navigator !== 'undefined' ? navigator.language : 'N/A', category: 'browser' },
    { label: 'Platform', value: typeof navigator !== 'undefined' ? navigator.platform : 'N/A', category: 'browser' },
    { label: 'Cookie Enabled', value: typeof navigator !== 'undefined' ? String(navigator.cookieEnabled) : 'N/A', category: 'browser' },
    { label: 'Online Status', value: typeof navigator !== 'undefined' ? (navigator.onLine ? 'Online' : 'Offline') : 'N/A', category: 'browser' },
  ]);

  // Routes data
  readonly routes = signal<RouteInfo[]>([]);
  readonly currentRoute = signal<string>('');

  // Components data
  readonly componentTree = signal<Array<{ name: string; depth: number; inputs?: Record<string, unknown> }>>([
    { name: 'AppComponent', depth: 0 },
    { name: 'RouterOutlet', depth: 1 },
    { name: 'HomeComponent | DemoComponent', depth: 2 },
    { name: 'DevtoolsComponent', depth: 1 },
  ]);

  // State data
  readonly panelState = signal({
    expanded: false,
    activeTab: 'info',
    uptime: '0s',
    lastUpdate: new Date().toLocaleTimeString(),
  });

  // Events data
  readonly events = signal<string[]>([
    '[DevTools] Panel initialized',
    '[DevTools] Ready for debugging',
    '[Router] Initial navigation complete',
  ]);

  // Console data
  readonly consoleLogs = signal<LogEntry[]>([]);

  // Network data
  readonly networkRequests = signal<NetworkRequest[]>([]);

  // Storage data
  readonly localStorageItems = signal<StorageItem[]>([]);
  readonly sessionStorageItems = signal<StorageItem[]>([]);

  // Performance data
  readonly performanceMetrics = signal<PerformanceMetric[]>([]);

  // Computed
  readonly activeTabLabel = computed(() => {
    const tab = this.tabs().find(t => t.id === this.activeTab());
    return tab?.label || 'Info';
  });

  readonly sessionDuration = computed(() => {
    const now = new Date();
    const diff = now.getTime() - this.startTime().getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  });

  readonly consoleErrorCount = computed(() => {
    return this.consoleLogs().filter(l => l.type === 'error' || l.type === 'warn').length;
  });

  constructor() {
    this.setupRouterTracking();
    this.setupConsoleIntercept();
    this.setupNetworkTracking();
    this.loadStorageData();
    this.loadPerformanceMetrics();
    this.startUptimeTimer();
  }

  toggle(): void {
    this.isExpanded.update(v => !v);
    this.panelState.update(s => ({ ...s, expanded: this.isExpanded(), lastUpdate: new Date().toLocaleTimeString() }));
    this.addEvent(`[Panel] ${this.isExpanded() ? 'Expanded' : 'Collapsed'}`);
  }

  selectTab(tabId: TabId): void {
    this.activeTab.set(tabId);
    this.panelState.update(s => ({ ...s, activeTab: tabId, lastUpdate: new Date().toLocaleTimeString() }));
    this.addEvent(`[Tab] Switched to "${tabId}" tab`);

    // Refresh data when switching to certain tabs
    if (tabId === 'storage') {
      this.loadStorageData();
    } else if (tabId === 'performance') {
      this.loadPerformanceMetrics();
    }
  }

  clearConsole(): void {
    this.consoleLogs.set([]);
    this.addEvent('[Console] Logs cleared');
  }

  clearNetwork(): void {
    this.networkRequests.set([]);
    this.addEvent('[Network] Requests cleared');
  }

  clearStorage(type: 'local' | 'session'): void {
    if (type === 'local') {
      localStorage.clear();
      this.loadStorageData();
      this.addEvent('[Storage] LocalStorage cleared');
    } else {
      sessionStorage.clear();
      this.loadStorageData();
      this.addEvent('[Storage] SessionStorage cleared');
    }
  }

  getSummary(): string {
    const tab = this.activeTab();
    switch (tab) {
      case 'info':
        return `Uptime: ${this.sessionDuration()}`;
      case 'routes':
        return `${this.routes().length} navigations`;
      case 'components':
        return `${this.componentTree().length} components`;
      case 'state':
        return `Tab: ${this.activeTab()}`;
      case 'events':
        return `${this.events().length} events`;
      case 'console':
        const errors = this.consoleErrorCount();
        return errors > 0 ? `${errors} errors/warnings` : 'No errors';
      case 'network':
        return `${this.networkRequests().length} requests`;
      case 'storage':
        return `${this.localStorageItems().length + this.sessionStorageItems().length} items`;
      case 'performance':
        return 'Metrics available';
      case 'settings':
        return 'Configuration';
      default:
        return '';
    }
  }

  private setupRouterTracking(): void {
    this.currentRoute.set(this.router.url);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute.set(event.urlAfterRedirects);
        this.routes.update(r => [...r, {
          path: event.urlAfterRedirects,
          url: event.urlAfterRedirects,
          timestamp: new Date().toLocaleTimeString(),
        }]);
        this.addEvent(`[Router] Navigated to "${event.urlAfterRedirects}"`);
      }
    });
  }

  private setupConsoleIntercept(): void {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;
    const originalDebug = console.debug;

    const addLog = (type: LogEntry['type'], args: unknown[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      this.consoleLogs.update(logs => [...logs, {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
      }]);

      // Update badge
      if (type === 'error' || type === 'warn') {
        this.tabs.update(tabs => tabs.map(t =>
          t.id === 'console' ? { ...t, badge: this.consoleErrorCount() } : t
        ));
      }
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

    console.debug = (...args) => {
      addLog('debug', args);
      originalDebug.apply(console, args);
    };
  }

  private setupNetworkTracking(): void {
    // Track fetch requests
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const id = Math.random().toString(36).substring(7);
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        const method = typeof args[1] === 'object' && args[1] ? args[1].method || 'GET' : 'GET';

        this.networkRequests.update(reqs => [...reqs, {
          id,
          method,
          url: String(url),
          timestamp: new Date().toLocaleTimeString(),
          type: 'fetch',
        }]);

        const startTime = performance.now();
        try {
          const response = await originalFetch.apply(window, args);
          const duration = performance.now() - startTime;

          this.networkRequests.update(reqs => reqs.map(r =>
            r.id === id ? { ...r, status: response.status, duration: Math.round(duration) } : r
          ));

          this.addEvent(`[Network] ${method} ${url} - ${response.status} (${Math.round(duration)}ms)`);
          return response;
        } catch (error) {
          const duration = performance.now() - startTime;
          this.networkRequests.update(reqs => reqs.map(r =>
            r.id === id ? { ...r, status: 0, duration: Math.round(duration) } : r
          ));
          throw error;
        }
      };
    }
  }

  private loadStorageData(): void {
    const localItems: StorageItem[] = [];
    const sessionItems: StorageItem[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          localItems.push({
            key,
            value: localStorage.getItem(key) || '',
            type: 'local',
          });
        }
      }

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          sessionItems.push({
            key,
            value: sessionStorage.getItem(key) || '',
            type: 'session',
          });
        }
      }
    } catch (e) {
      // Storage may not be available
    }

    this.localStorageItems.set(localItems);
    this.sessionStorageItems.set(sessionItems);
  }

  private loadPerformanceMetrics(): void {
    const metrics: PerformanceMetric[] = [];

    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      // Navigation timing
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const nav = navEntries[0];
        metrics.push(
          { name: 'DNS Lookup', value: Math.round(nav.domainLookupEnd - nav.domainLookupStart), unit: 'ms', category: 'timing' },
          { name: 'TCP Connection', value: Math.round(nav.connectEnd - nav.connectStart), unit: 'ms', category: 'timing' },
          { name: 'Time to First Byte', value: Math.round(nav.responseStart), unit: 'ms', category: 'timing' },
          { name: 'Page Load Time', value: Math.round(nav.loadEventEnd - nav.startTime), unit: 'ms', category: 'timing' },
          { name: 'DOM Interactive', value: Math.round(nav.domInteractive), unit: 'ms', category: 'timing' },
          { name: 'DOM Complete', value: Math.round(nav.domComplete), unit: 'ms', category: 'timing' },
        );
      }

      // Resource timing
      const resourceEntries = performance.getEntriesByType('resource');
      const totalTransferSize = resourceEntries.reduce((sum, r) => sum + (r as PerformanceResourceTiming).transferSize || 0, 0);
      metrics.push({
        name: 'Total Resources',
        value: resourceEntries.length,
        unit: 'files',
        category: 'resource',
      });
      metrics.push({
        name: 'Total Transfer Size',
        value: Math.round(totalTransferSize / 1024),
        unit: 'KB',
        category: 'resource',
      });
    }

    // Memory (Chrome only)
    if ('memory' in performance) {
      const mem = (performance as unknown as { memory?: { usedJSHeapSize?: number; totalJSHeapSize?: number } }).memory;
      if (mem?.usedJSHeapSize) {
        metrics.push(
          { name: 'Used JS Heap', value: Math.round(mem.usedJSHeapSize / 1024 / 1024), unit: 'MB', category: 'memory' },
          { name: 'Total JS Heap', value: Math.round(mem.totalJSHeapSize / 1024 / 1024), unit: 'MB', category: 'memory' },
        );
      }
    }

    this.performanceMetrics.set(metrics);
  }

  private startUptimeTimer(): void {
    setInterval(() => {
      this.panelState.update(s => ({ ...s, uptime: this.sessionDuration(), lastUpdate: new Date().toLocaleTimeString() }));
    }, 1000);
  }

  private addEvent(message: string): void {
    this.events.update(events => [...events, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }
}
