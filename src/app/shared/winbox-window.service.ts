import { computed, Injectable, signal } from '@angular/core';

export interface WinBoxWindow {
  id: string;
  title: string;
  instance: any;
  minimized: boolean;
  active: boolean;
  color?: string;
  html?: string;
  createdAt: number;
}

export const TOP_PANEL_HEIGHT = 88; // Height of the two-row panel (44px header + 44px tabs)
export const WINBOX_TITLE_BAR_HEIGHT = 28; // Approximate WinBox title bar height
export const WINDOW_TOP_MARGIN = 8; // Additional margin below panel

@Injectable({
  providedIn: 'root',
})
export class WinBoxWindowService {
  private windows = signal<WinBoxWindow[]>([]);
  private activeWindowId = signal<string | null>(null);
  private allHidden = signal(false);
  private resizeObserver: ResizeObserver | null = null;

  windowsList = computed(() => this.windows());
  activeWindow = computed(() => {
    const activeId = this.activeWindowId();
    if (!activeId) return null;
    return this.windows().find((w) => w.id === activeId) || null;
  });
  hasWindows = computed(() => this.windows().length > 0);
  hasMinimized = computed(() => this.windows().some((w) => w.minimized));
  areAllHidden = computed(() => this.allHidden());

  constructor() {
    // Setup resize observer to handle window maximization on browser resize
    this.setupResizeObserver();
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      // Update all maximized windows when browser is resized
      this.windows().forEach((win) => {
        if (win.instance && !win.minimized) {
          // Check if window is maximized (positioned at top with margin)
          const isMaximized =
            win.instance.x === 0 && win.instance.y <= TOP_PANEL_HEIGHT + WINDOW_TOP_MARGIN;
          if (isMaximized) {
            win.instance.resize(
              window.innerWidth,
              window.innerHeight - TOP_PANEL_HEIGHT - WINDOW_TOP_MARGIN
            );
            win.instance.move(0, TOP_PANEL_HEIGHT + WINDOW_TOP_MARGIN);
          }
        }
      });
    });
    this.resizeObserver.observe(document.body);
  }

  createWindow(options: {
    title: string;
    width?: number | string;
    height?: number | string;
    x?: number | string | 'center';
    y?: number | string | 'center';
    html?: string;
    background?: string;
    onclose?: () => void;
    maximize?: boolean;
  }): WinBoxWindow {
    const id = `winbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Offset windows slightly if multiple windows exist (only for non-maximized)
    const existingWindows = this.windows().length;
    const offset = existingWindows * 30;

    // Default to maximized (respecting top panel, no margins)
    const shouldMaximize = options.maximize ?? true;

    // Calculate dimensions for maximized mode (zero margins, respecting top panel)
    // Position window so title bar is visible below the panel with slight margin
    const windowWidth = shouldMaximize
      ? window.innerWidth
      : typeof options.width === 'number'
        ? options.width
        : 600;
    const windowHeight = shouldMaximize
      ? window.innerHeight - TOP_PANEL_HEIGHT - WINDOW_TOP_MARGIN
      : typeof options.height === 'number'
        ? options.height
        : 400;
    const xPos = shouldMaximize ? 0 : typeof options.x === 'number' ? options.x : 20 + offset;
    const yPos = shouldMaximize
      ? TOP_PANEL_HEIGHT + WINDOW_TOP_MARGIN
      : typeof options.y === 'number'
        ? options.y
        : TOP_PANEL_HEIGHT + 10 + offset;

    const winboxInstance = new (window as any).WinBox({
      title: options.title,
      width: windowWidth,
      height: windowHeight,
      x: xPos,
      y: yPos,
      html: options.html ?? '',
      background: options.background,
      index: this.windows().length + 1,
      onfocus: () => {
        this.setActiveWindow(id);
      },
      onblur: () => {
        // Optional: handle blur
      },
      onminimize: () => {
        this.minimizeWindow(id);
      },
      onrestore: () => {
        this.restoreWindow(id);
      },
      onclose: () => {
        this.removeWindow(id);
        if (options.onclose) {
          options.onclose();
        }
        return false; // Prevent default close, we handle it
      },
    });

    // Add custom styling for better content padding
    setTimeout(() => {
      const winboxBody = winboxInstance.body;
      if (winboxBody) {
        winboxBody.style.padding = '24px';
        winboxBody.style.overflow = 'auto';
        winboxBody.style.lineHeight = '1.6';
      }
    }, 0);

    // Maximize the window after creation if requested (ensure exact sizing)
    if (shouldMaximize) {
      // Small delay to ensure WinBox is fully initialized
      setTimeout(() => {
        winboxInstance.resize(
          window.innerWidth,
          window.innerHeight - TOP_PANEL_HEIGHT - WINDOW_TOP_MARGIN
        );
        winboxInstance.move(0, TOP_PANEL_HEIGHT + WINDOW_TOP_MARGIN);
        console.log('[WinBoxService] Window positioned:', {
          x: 0,
          y: TOP_PANEL_HEIGHT + WINDOW_TOP_MARGIN,
          width: window.innerWidth,
          height: window.innerHeight - TOP_PANEL_HEIGHT - WINDOW_TOP_MARGIN,
          panelHeight: TOP_PANEL_HEIGHT,
          topMargin: WINDOW_TOP_MARGIN,
        });
      }, 100);
    }

    const newWindow: WinBoxWindow = {
      id,
      title: options.title,
      instance: winboxInstance,
      minimized: false,
      active: false,
      color: options.background,
      html: options.html,
      createdAt: Date.now(),
    };

    this.windows.update((windows) => [...windows, newWindow]);
    this.setActiveWindow(id);

    return newWindow;
  }

  setActiveWindow(id: string): void {
    this.activeWindowId.set(id);
    this.windows.update((windows) =>
      windows.map((w) => ({
        ...w,
        active: w.id === id,
      }))
    );

    const window = this.windows().find((w) => w.id === id);
    if (window && window.instance) {
      window.instance.focus();
    }
  }

  minimizeWindow(id: string): void {
    const window = this.windows().find((w) => w.id === id);
    if (window && window.instance) {
      window.instance.hide();
      this.windows.update((windows) =>
        windows.map((w) => (w.id === id ? { ...w, minimized: true, active: false } : w))
      );

      // Focus next available window
      const otherWindows = this.windows().filter((w) => w.id !== id && !w.minimized);
      if (otherWindows.length > 0) {
        this.setActiveWindow(otherWindows[otherWindows.length - 1].id);
      } else {
        this.activeWindowId.set(null);
      }
    }
  }

  restoreWindow(id: string): void {
    const window = this.windows().find((w) => w.id === id);
    if (window && window.instance) {
      window.instance.show();
      window.instance.focus();
      this.windows.update((windows) =>
        windows.map((w) => (w.id === id ? { ...w, minimized: false, active: true } : w))
      );
      this.activeWindowId.set(id);
    }
  }

  closeWindow(id: string): void {
    const window = this.windows().find((w) => w.id === id);
    if (window && window.instance) {
      window.instance.close(true);
    }
    this.removeWindow(id);
  }

  removeWindow(id: string): void {
    this.windows.update((windows) => windows.filter((w) => w.id !== id));

    if (this.activeWindowId() === id) {
      const remaining = this.windows();
      if (remaining.length > 0) {
        this.setActiveWindow(remaining[remaining.length - 1].id);
      } else {
        this.activeWindowId.set(null);
      }
    }
  }

  minimizeAll(): void {
    this.windows().forEach((w) => {
      if (!w.minimized && w.instance) {
        w.instance.minimize();
      }
    });
  }

  restoreAll(): void {
    this.windows().forEach((w) => {
      if (w.minimized && w.instance) {
        w.instance.restore();
      }
    });
  }

  closeAll(): void {
    const windowIds = [...this.windows()].map((w) => w.id);
    windowIds.forEach((id) => this.closeWindow(id));
  }

  /**
   * Hide all windows (send them to the panel without minimizing)
   */
  hideAll(): void {
    this.windows().forEach((w) => {
      if (w.instance && !w.minimized) {
        w.instance.hide();
      }
    });
    this.windows.update((windows) =>
      windows.map((w) => ({ ...w, minimized: true, active: false }))
    );
    this.allHidden.set(true);
    this.activeWindowId.set(null);
  }

  /**
   * Show all windows (restore from hidden state)
   */
  showAll(): void {
    const windows = this.windows();
    if (windows.length === 0) return;

    windows.forEach((w) => {
      if (w.instance && w.minimized) {
        w.instance.show();
      }
    });
    this.windows.update((windows) => windows.map((w) => ({ ...w, minimized: false })));
    this.allHidden.set(false);
    // Focus the last window
    const lastWindow = windows[windows.length - 1];
    if (lastWindow) {
      this.setActiveWindow(lastWindow.id);
    }
  }

  /**
   * Toggle hide/show all windows
   */
  toggleAll(): void {
    if (this.allHidden()) {
      this.showAll();
    } else {
      this.hideAll();
    }
  }

  focusPrevious(): void {
    const windows = this.windows().filter((w) => !w.minimized);
    if (windows.length < 2) return;

    const currentIndex = windows.findIndex((w) => w.active);
    const previousIndex = currentIndex <= 0 ? windows.length - 1 : currentIndex - 1;
    this.setActiveWindow(windows[previousIndex].id);
  }

  focusNext(): void {
    const windows = this.windows().filter((w) => !w.minimized);
    if (windows.length < 2) return;

    const currentIndex = windows.findIndex((w) => w.active);
    const nextIndex = currentIndex >= windows.length - 1 ? 0 : currentIndex + 1;
    this.setActiveWindow(windows[nextIndex].id);
  }
}
