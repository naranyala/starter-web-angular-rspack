# WinBox Top Panel Implementation

## Overview

A fixed-top collapsible panel that manages all WinBox.js windows as tab-like items, replacing the default bottom minimized windows behavior.

## Features

### Fixed Top Panel (Non-Collapsible)
- **Position**: Fixed at the top of the screen
- **State**: Always visible (not collapsible)
- **Two-row design**:
  - **Row 1 (Header)**: App title, window count, and action buttons (36px)
  - **Row 2 (Tabs)**: Window tabs list (36px)
- **Total Height**: 72px
- **Design**: Dark gradient background with modern styling

### 🏠 Home Button (Built-in Tab)
- **Position**: First tab in the panel (cannot be removed)
- **Click Action**: Hide all visible windows (one-click)
- **Visual States**:
  - **Blue** (default): Windows are visible
  - **Green**: All windows are hidden
- **Window Indicator**: Shows count of open windows when visible

### Auto-Maximized Windows
- New windows are **maximized by default**
- **Zero margins** - windows fill the entire screen below the panel
- WinBox title bar visible below the panel
- Respects top panel height (72px) - windows start at y=72px
- **Full height** - extends to bottom of viewport with no gap
- **Responsive**: Automatically adjusts on browser resize
- Default dimensions: `window.innerWidth` × `window.innerHeight - 72`
- **Customizable**: Pass `maximize: false` to disable auto-maximize

### Tab-like Window Management
- Each WinBox window appears as a tab in the panel
- **Color Indicator**: Colored dot showing the window's theme color
- **Active State**: Highlighted tab for the currently focused window
- **Minimized State**: Dimmed tabs for minimized windows
- **Quick Close**: × button on each tab to close the window

### Actions (Header Row)
- **Minimize All** (⬇ All): Minimize all open windows
- **Restore All** (⬆ All): Restore all minimized windows
- **Close Window**: Use WinBox.js built-in close button (×) on each window

### Tab Actions
- **Click Tab**: Restore (if minimized) and focus the window
- **Home Button**: Hide all visible windows (one-click)
- **Close Window**: Use WinBox.js built-in close button (×) on each window title bar

## Files Created/Modified

### New Files
1. **`src/app/shared/winbox-window.service.ts`**
   - Centralized service for managing WinBox windows
   - Tracks window state (active, minimized, etc.)
   - Provides methods for create, minimize, restore, close operations

2. **`src/app/shared/winbox-panel.component.ts`**
   - The fixed-top collapsible panel UI component
   - Tab bar showing all windows
   - Action buttons for bulk operations

3. **`src/app/shared/index.ts`**
   - Barrel exports for shared module

### Modified Files
1. **`src/app/app.component.ts`**
   - Added `WinBoxPanelComponent` import
   - Added `<app-winbox-panel>` to template

2. **`src/app/home/home.component.ts`**
   - Replaced direct WinBox usage with `WinBoxWindowService`

3. **`src/app/demo/demo.component.ts`**
   - Replaced direct WinBox usage with `WinBoxWindowService`
   - Simplified window creation logic

4. **`src/styles.css`**
   - Added top padding to body for panel clearance
   - Added z-index adjustments for WinBox windows

## Usage

### Creating Windows

Instead of directly using WinBox:
```typescript
// Old way (don't use)
new WinBox({ title: 'My Window', html: '...' });
```

Use the service:
```typescript
import { WinBoxWindowService } from './shared/winbox-window.service';

// In your component
private windowService = inject(WinBoxWindowService);

openWindow() {
  this.windowService.createWindow({
    title: 'My Window',
    html: '<div>Content</div>',
    background: '#ff0000', // Optional color
    // maximize: true is default
  });
}

// Or create a non-maximized window:
openSmallWindow() {
  this.windowService.createWindow({
    title: 'Small Window',
    width: 400,
    height: 300,
    maximize: false, // Disable auto-maximize
  });
}
```

### Service API

```typescript
// Create a new window (auto-maximized)
createWindow(options: CreateWindowOptions): WinBoxWindow

// Focus a window
setActiveWindow(id: string): void

// Minimize/Restore a window
minimizeWindow(id: string): void
restoreWindow(id: string): void

// Close a window
closeWindow(id: string): void

// Hide/Show all windows (Home button functionality)
hideAll(): void      // Hide all windows
showAll(): void      // Show all windows
toggleAll(): void    // Toggle hide/show

// Bulk operations
minimizeAll(): void
restoreAll(): void
closeAll(): void

// Navigation
focusPrevious(): void
focusNext(): void
```

### Service Signals

```typescript
hasWindows: Signal<boolean>      // true if any windows exist
hasMinimized: Signal<boolean>    // true if any windows are minimized
areAllHidden: Signal<boolean>    // true if all windows are hidden (Home button state)
windowsList: Signal<WinBoxWindow[]>  // all windows
activeWindow: Signal<WinBoxWindow | null>  // currently focused window
```

## Styling

The panel uses a dark theme with:
- **Toggle Bar**: Gradient blue-gray (#2c3e50 → #34495e)
- **Tab Bar**: Dark blue (#16213e)
- **Active Tab**: Darker background (#1a1a2e)
- **Minimized Tabs**: Dimmed appearance
- **Color Dots**: Match window background colors

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🪟 Window Manager    [3 windows]              ⬆ All  ⬇ All             │ ← Header (36px)
├─────────────────────────────────────────────────────────────────────────┤
│ 🏠 Home │ ● Tab1 │ ● Tab2 │ ● Tab3 │                                   │ ← Tabs (36px)
└─────────────────────────────────────────────────────────────────────────┘
  ↓ 8px margin
┌─────────────────────────────────────────────────────────────────────────┐
│┌──────────────────────────────────────────────────────────────────────┐│
││  WinBox Title (with × close button)                                  ││ ← Use this × to close
│├──────────────────────────────────────────────────────────────────────┤│
││  Window Content                                                      ││
│└──────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Single-Column Card Layout
- **Home & Demo pages**: Vertical card list
- **Sticky search bar**: Stays visible at 84px (below panel + margin)
- **Horizontal card design**: Icon/category on left, content on right
- **Hover effect**: Cards slide right (→) instead of up (↑)
- **Responsive**: Optimized for mobile with reduced padding

## Z-Index Hierarchy

```
10000 - WinBox Panel (topmost)
 9998 - WinBox Windows
    0 - Page Content
```

## Responsive Design

- On mobile (< 768px): Shortcuts hidden, tabs reduced to 150px max-width
- Horizontal scrolling for many tabs
- Touch-friendly tap targets

## Future Enhancements

Possible improvements:
- Window preview on hover
- Drag-and-drop tab reordering
- Window grouping/categorization
- Search/filter windows
- Persist window state across reloads
- Customizable panel position (left/right/center alignment)
