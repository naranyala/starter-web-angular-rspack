# Architecture

This document describes the application architecture, design patterns, and technical decisions.

## Table of Contents

- [Overview](#overview)
- [Application Structure](#application-structure)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Routing](#routing)
- [Build System](#build-system)
- [Design Patterns](#design-patterns)

## Overview

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Angular 21.x (Component Framework)                         │
│  ├── Signals (Reactivity)                                   │
│  ├── Standalone Components                                  │
│  └── Dependency Injection                                   │
├─────────────────────────────────────────────────────────────┤
│  Rspack (Bundler)                                           │
│  ├── esbuild-loader (TypeScript)                            │
│  ├── sass-loader (SCSS)                                     │
│  └── Asset Processing                                       │
├─────────────────────────────────────────────────────────────┤
│  Bun (Runtime)                                              │
│  ├── Package Manager                                        │
│  ├── Test Runner                                            │
│  └── Script Execution                                       │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Standalone Components** | Simpler, no NgModules needed |
| **Signals** | Modern reactivity, better performance |
| **Rspack** | 10-100x faster than Webpack |
| **Bun** | Faster installs, native test runner |
| **Inline Templates** | Co-located template and logic |
| **External CSS** | Separated styles for maintainability |

## Application Structure

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   App Component                       │  │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐ │  │
│  │  │  WinBox Panel   │  │      Router Outlet          │ │  │
│  │  │  (Fixed Top)    │  │  ┌───────────────────────┐  │ │  │
│  │  │  - Header Row   │  │  │   Home Component      │  │ │  │
│  │  │  - Tabs Row     │  │  │   - Card List         │  │ │  │
│  │  └─────────────────┘  │  │   - Search            │  │ │  │
│  │                       │  │   - WinBox Creator    │  │ │  │
│  │  WinBox Windows       │  └───────────────────────┘  │ │  │
│  │  ┌─────────────────┐  │  ┌───────────────────────┐  │ │  │
│  │  │  Window 1       │  │  │   Demo Component      │  │ │  │
│  │  │  - Title Bar    │  │  │   - Tech Cards        │  │ │  │
│  │  │  - Content      │  │  │   - WinBox Creator    │  │ │  │
│  │  └─────────────────┘  │  └───────────────────────┘  │ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### File Organization

```
src/
├── app/
│   ├── app.component.ts          # Root component
│   ├── app.config.ts             # App configuration
│   ├── app-routing.module.ts     # Routing config
│   │
│   ├── home/                     # Home page feature
│   │   ├── home.component.ts     # Component class
│   │   ├── home.component.css    # Component styles
│   │   └── home.component.spec.ts # Unit tests
│   │
│   ├── demo/                     # Demo page feature
│   │   ├── demo.component.ts
│   │   ├── demo.component.css
│   │   └── demo.component.spec.ts
│   │
│   ├── shared/                   # Shared across features
│   │   ├── winbox-window.service.ts  # Window management service
│   │   ├── winbox-panel.component.ts # Top panel component
│   │   ├── winbox-panel.component.css
│   │   └── index.ts              # Barrel exports
│   │
│   ├── devtools/                 # Angular DevTools (optional)
│   │   ├── devtools-panel.component.ts
│   │   ├── console/
│   │   ├── components/
│   │   ├── network/
│   │   └── ...
│   │
│   └── error-handling/           # Error handling utilities
│       ├── error-modal.component.ts
│       └── window-error-handler.ts
│
├── assets/                       # Static assets
├── environments/                 # Environment configs
│   ├── environment.ts
│   └── environment.prod.ts
│
├── types/                        # TypeScript type definitions
│   └── winbox.d.ts
│
├── styles.css                    # Global styles
├── index.html                    # Main HTML template
└── main.ts                       # Application entry point
```

## Component Architecture

### Component Types

#### 1. **Page Components** (Home, Demo)
- Full-page components
- Route targets
- Own their data and state

```typescript
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './home.component.html',  // Inline template
  styleUrls: ['./home.component.css'],    // External CSS
})
export class HomeComponent {
  // Component logic
}
```

#### 2. **Shared Components** (WinBoxPanel)
- Reusable across the app
- No route targets
- Input/Output based

```typescript
@Component({
  selector: 'app-winbox-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './winbox-panel.component.html',
  styleUrls: ['./winbox-panel.component.css'],
})
export class WinBoxPanelComponent {
  // Shared logic
}
```

#### 3. **Smart vs Presentational**

| Smart Components | Presentational Components |
|-----------------|---------------------------|
| Home, Demo | WinBoxPanel |
| Manage state | Receive data via inputs |
| Inject services | Emit events via outputs |
| Route targets | Reusable |

### Component Communication

```
┌─────────────────────────────────────────────────────────────┐
│                    Communication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐         ┌──────────────┐                  │
│  │   Service   │◄────────┤   Component  │                  │
│  │  (Singleton)│ inject()│   (Smart)    │                  │
│  └─────────────┘         └──────────────┘                  │
│         ▲                       │                          │
│         │                       │                          │
│         │         ┌─────────────┴──────────┐               │
│         │         │                        │               │
│  ┌──────┴──────┐  │              ┌─────────▼────────┐     │
│  │   Service   │◄─┘              │   Component      │     │
│  │  (Singleton)│ inject()        │   (Shared)       │     │
│  └─────────────┘                 └──────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## State Management

### Signal-Based Reactivity

```typescript
import { signal, computed } from '@angular/core';

export class WinBoxWindowService {
  // Writable signal
  private windows = signal<WinBoxWindow[]>([]);
  
  // Computed signal (read-only, auto-updates)
  windowsList = computed(() => this.windows());
  
  // Derived computed signal
  hasWindows = computed(() => this.windows().length > 0);
  
  // Update signal
  addWindow(window: WinBoxWindow) {
    this.windows.update(windows => [...windows, window]);
  }
}
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WinBoxWindowService (Singleton)                            │
│  ├── windows: Signal<WinBoxWindow[]>                        │
│  ├── activeWindowId: Signal<string | null>                  │
│  ├── allHidden: Signal<boolean>                             │
│  │                                                          │
│  ├── createWindow(options): WinBoxWindow                    │
│  ├── setActiveWindow(id): void                              │
│  ├── minimizeWindow(id): void                               │
│  ├── restoreWindow(id): void                                │
│  ├── hideAll(): void                                        │
│  ├── showAll(): void                                        │
│  └── toggleAll(): void                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Routing

### Route Configuration

```typescript
const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'demo',
    loadComponent: () => import('./demo/demo.component')
      .then(m => m.DemoComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
```

### Lazy Loading

```typescript
// Components are lazy-loaded on navigation
loadComponent: () => import('./home/home.component')
  .then(m => m.HomeComponent)
```

**Benefits:**
- Smaller initial bundle
- Faster initial load
- On-demand loading

## Build System

### Rspack Configuration

```javascript
module.exports = {
  mode: 'development' | 'production',
  entry: './src/main.ts',
  output: {
    path: './dist/angular-rspack-demo',
    filename: '[name].[contenthash].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'esbuild-loader',  // Fast TypeScript compilation
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new HtmlRspackPlugin({ template: './src/index.html' }),
  ],
};
```

### Build Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                      Build Pipeline                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Source Files                                               │
│  ├── *.ts                                                   │
│  ├── *.css                                                  │
│  ├── *.scss                                                 │
│  └── *.html                                                 │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Rspack Processing                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  TypeScript → esbuild-loader → JavaScript           │   │
│  │  SCSS → sass-loader → CSS                           │   │
│  │  HTML → html-rspack-plugin → Processed HTML         │   │
│  │  Assets → Asset modules → Optimized assets          │   │
│  └─────────────────────────────────────────────────────┘   │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Optimization                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Tree Shaking (remove unused code)                  │   │
│  │  Minification (reduce file size)                    │   │
│  │  Code Splitting (multiple bundles)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│       │                                                     │
│       ▼                                                     │
│  Output Files                                               │
│  ├── main.[hash].js                                         │
│  ├── styles.[hash].css                                      │
│  ├── index.html                                             │
│  └── assets/                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Design Patterns

### 1. **Service Pattern**
Singleton services for shared state and logic.

```typescript
@Injectable({ providedIn: 'root' })
export class WinBoxWindowService {
  // Singleton instance
  // Shared across all components
}
```

### 2. **Signal Pattern**
Reactive state management with Angular Signals.

```typescript
// State
private count = signal(0);

// Computed
readonly doubleCount = computed(() => this.count() * 2);

// Update
this.count.update(c => c + 1);
```

### 3. **Component Composition**
Building complex UIs from simple components.

```
App Component
├── WinBoxPanel (shared)
├── RouterOutlet
│   ├── Home Component
│   └── Demo Component
└── ErrorModal (shared)
```

### 4. **Dependency Injection**
Angular's DI for service injection.

```typescript
export class HomeComponent {
  // Inject service
  private windowService = inject(WinBoxWindowService);
  
  // Inject Router
  private router = inject(Router);
}
```

## Next Steps

- [WinBox Panel Guide](./03-winbox-panel.md) - Deep dive into window management
- [Components Guide](./04-components.md) - Component documentation
- [Styling Guide](./05-styling.md) - CSS and theming
