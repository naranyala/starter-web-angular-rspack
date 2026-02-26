import { type ApplicationRef, Injectable, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  type Router,
} from '@angular/router';
import { tap } from 'rxjs/operators';

export interface DevtoolsComponentInfo {
  name: string;
  selector: string;
  standalone: boolean;
  inputs: Record<string, unknown>;
  outputs: string[];
  hostElement: HTMLElement | null;
  children: DevtoolsComponentInfo[];
}

export interface DevtoolsRouteInfo {
  path: string;
  url: string;
  routeConfig: {
    path?: string;
    component?: string;
    loadChildren?: string;
    canActivate?: string[];
  } | null;
  params: Record<string, string>;
  queryParams: Record<string, string>;
  fragment: string | null;
}

export interface DevtoolsNavigationEntry {
  url: string;
  timestamp: number;
  type: 'navigation' | 'error' | 'cancel';
  details?: string;
}

export interface DevtoolsPerformanceMetrics {
  changeDetectionCount: number;
  lastChangeDetectionTime: number | null;
  averageChangeDetectionTime: number;
  componentCount: number;
  directiveCount: number;
  pipeCount: number;
  zoneStable: boolean;
  ngZoneInZone: boolean;
}

export interface DevtoolsServiceInfo {
  name: string;
  providedIn: string;
  state?: Record<string, unknown>;
}

export interface DevtoolsBuildInfo {
  angularVersion: string;
  production: boolean;
  buildTime: string;
  typescriptVersion: string;
  rspackVersion: string;
  bunVersion: string | null;
}

/**
 * Devtools Service - Core introspection service for Angular applications
 * Provides comprehensive application state inspection capabilities
 */
@Injectable({
  providedIn: 'root',
})
export class DevtoolsService {
  // Signals for reactive state
  private readonly navigationHistory = signal<DevtoolsNavigationEntry[]>([]);
  private readonly currentRoute = signal<DevtoolsRouteInfo | null>(null);
  private readonly performanceMetrics = signal<DevtoolsPerformanceMetrics>({
    changeDetectionCount: 0,
    lastChangeDetectionTime: null,
    averageChangeDetectionTime: 0,
    componentCount: 0,
    directiveCount: 0,
    pipeCount: 0,
    zoneStable: true,
    ngZoneInZone: false,
  });

  // Computed signals
  readonly navigationHistory$ = this.navigationHistory.asReadonly();
  readonly currentRoute$ = this.currentRoute.asReadonly();
  readonly performanceMetrics$ = this.performanceMetrics.asReadonly();

  private changeDetectionTimes: number[] = [];
  private readonly maxHistoryEntries = 50;

  constructor(
    private router: Router,
    private appRef: ApplicationRef
  ) {
    this.setupRouteTracking();
    this.setupPerformanceTracking();
  }

  /**
   * Get comprehensive build and environment information
   */
  getBuildInfo(): DevtoolsBuildInfo {
    const ngVersion = this.getAngularVersion();
    return {
      angularVersion: ngVersion,
      production: typeof ngDevMode === 'undefined' || !(ngDevMode as any),
      buildTime: new Date().toISOString(),
      typescriptVersion: this.getTypeScriptVersion(),
      rspackVersion: this.getRspackVersion(),
      bunVersion: this.getBunVersion(),
    };
  }

  /**
   * Get component tree starting from root
   */
  getComponentTree(): DevtoolsComponentInfo[] {
    const views = (this.appRef as any)._views || [];
    return this.extractComponentInfo(views, 0);
  }

  /**
   * Get all registered services with their states
   */
  getServices(): DevtoolsServiceInfo[] {
    // This is a simplified version - full implementation would require
    // accessing the Angular injector tree
    return [
      {
        name: 'DevtoolsService',
        providedIn: 'root',
        state: {
          navigationHistoryLength: this.navigationHistory().length,
          hasCurrentRoute: !!this.currentRoute(),
        },
      },
    ];
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): DevtoolsPerformanceMetrics {
    return this.performanceMetrics();
  }

  /**
   * Trigger change detection manually
   */
  triggerChangeDetection(): void {
    this.appRef.tick();
  }

  /**
   * Get navigation history
   */
  getNavigationHistory(): DevtoolsNavigationEntry[] {
    return this.navigationHistory();
  }

  /**
   * Clear navigation history
   */
  clearNavigationHistory(): void {
    this.navigationHistory.set([]);
  }

  /**
   * Get Angular version
   */
  private getAngularVersion(): string {
    try {
      // Try to get version from Angular core
      const ngCore = window as Record<string, any>;
      if (ngCore['ng']?.version) {
        return ngCore['ng'].version.full;
      }
      // Fallback: try to detect from package
      return '21.2.0'; // Current version in package.json
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get TypeScript version
   */
  private getTypeScriptVersion(): string {
    try {
      // TypeScript version is usually available in the build
      return '5.9.3'; // Current version in package.json
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get Rspack version
   */
  private getRspackVersion(): string {
    try {
      return '1.7.6'; // Current version in package.json
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get Bun version
   */
  private getBunVersion(): string | null {
    try {
      // @ts-expect-error - Bun is not always available
      if (typeof Bun !== 'undefined' && Bun.version) {
        // @ts-expect-error
        return Bun.version;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Setup route tracking
   */
  private setupRouteTracking(): void {
    this.router.events
      .pipe(
        tap((event) => {
          if (event instanceof NavigationStart) {
            this.addNavigationEntry(event.url, 'navigation', 'Navigation started');
          } else if (event instanceof NavigationEnd) {
            this.updateCurrentRoute(event.urlAfterRedirects);
            this.addNavigationEntry(event.urlAfterRedirects, 'navigation', 'Navigation completed');
          } else if (event instanceof NavigationCancel) {
            this.addNavigationEntry(event.url, 'cancel', event.reason);
          } else if (event instanceof NavigationError) {
            this.addNavigationEntry(event.url, 'error', event.error?.message || 'Unknown error');
          }
        })
      )
      .subscribe();

    // Initialize current route
    if (this.router.routerState.snapshot.root) {
      this.updateCurrentRoute(this.router.url);
    }
  }

  /**
   * Update current route info
   */
  private updateCurrentRoute(url: string): void {
    const snapshot = this.router.routerState.snapshot.root;
    if (!snapshot) return;

    let route = snapshot;
    while (route.firstChild) {
      route = route.firstChild;
    }

    this.currentRoute.set({
      path: route.routeConfig?.path || '',
      url,
      routeConfig: route.routeConfig
        ? {
            path: route.routeConfig.path,
            component: route.routeConfig.component?.name,
            loadChildren: route.routeConfig.loadChildren?.toString().slice(0, 100),
            canActivate: route.routeConfig.canActivate?.map((c) => String(c)).join(', ') || '',
          }
        : null,
      params: route.params,
      queryParams: route.queryParams,
      fragment: route.fragment,
    });
  }

  /**
   * Add navigation entry to history
   */
  private addNavigationEntry(
    url: string,
    type: 'navigation' | 'error' | 'cancel',
    details?: string
  ): void {
    const entry: DevtoolsNavigationEntry = {
      url,
      timestamp: Date.now(),
      type,
      details,
    };

    this.navigationHistory.update((history) => {
      const newHistory = [entry, ...history];
      return newHistory.slice(0, this.maxHistoryEntries);
    });
  }

  /**
   * Setup performance tracking
   */
  private setupPerformanceTracking(): void {
    // Track change detection cycles
    const originalTick = this.appRef.tick.bind(this.appRef);
    let tickCount = 0;
    let _totalTime = 0;

    this.appRef.tick = () => {
      const start = performance.now();
      originalTick();
      const duration = performance.now() - start;

      tickCount++;
      _totalTime += duration;
      this.changeDetectionTimes.push(duration);

      // Keep only last 100 measurements
      if (this.changeDetectionTimes.length > 100) {
        this.changeDetectionTimes.shift();
      }

      const avgTime = this.changeDetectionTimes.length
        ? this.changeDetectionTimes.reduce((a, b) => a + b, 0) / this.changeDetectionTimes.length
        : 0;

      this.performanceMetrics.update((metrics) => ({
        ...metrics,
        changeDetectionCount: tickCount,
        lastChangeDetectionTime: duration,
        averageChangeDetectionTime: avgTime,
      }));
    };

    // Count components, directives, pipes
    this.updateComponentCounts();
  }

  /**
   * Update component/directive/pipe counts
   */
  private updateComponentCounts(): void {
    // This is a simplified count - full implementation would traverse the component tree
    setTimeout(() => {
      this.performanceMetrics.update((metrics) => ({
        ...metrics,
        componentCount: document.querySelectorAll('[class], [id]').length,
        directiveCount: document.querySelectorAll('[ngFor], [ngIf], [ngSwitch], [routerLink]')
          .length,
        pipeCount: 0, // Pipes are harder to count without AST access
      }));
    }, 1000);
  }

  /**
   * Extract component info from view tree
   */
  private extractComponentInfo(views: any[], depth: number): DevtoolsComponentInfo[] {
    if (depth > 10 || !views) return []; // Prevent infinite recursion

    const result: DevtoolsComponentInfo[] = [];

    for (const view of views) {
      if (!view) continue;

      try {
        const component = view.component;
        if (component) {
          const info: DevtoolsComponentInfo = {
            name: component.constructor?.name || 'Unknown',
            selector: component.constructor?.selector || '',
            standalone: component.constructor?.standalone || false,
            inputs: { ...component },
            outputs: [],
            hostElement: null,
            children: this.extractComponentInfo(view.childViews || [], depth + 1),
          };

          result.push(info);
        }

        // Process child views
        const childViews = view.childViews || [];
        result.push(...this.extractComponentInfo(childViews, depth + 1));
      } catch {
        // Skip views that can't be inspected
      }
    }

    return result;
  }
}
