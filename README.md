# Angular Rspack Starter

A modern Angular 19 starter project configured with Rspack bundler and Bun runtime for improved build performance.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Build System Comparison](#build-system-comparison)
- [Key Dependencies](#key-dependencies)
- [Code Quality](#code-quality)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

This project provides a starter template for Angular applications using:

- **Angular 19.2** - Latest Angular framework with standalone components
- **Rspack 1.3.5** - Fast Rust-based bundler (webpack-compatible)
- **Bun 1.3** - Fast JavaScript runtime, package manager, and test runner
- **Biome** - Fast linter and formatter written in Rust
- **Playwright** - Modern e2e testing framework

The setup maintains compatibility with traditional Angular CLI builds while offering faster build times through Rspack and Bun.

## Prerequisites

- Node.js v18+ (or use Bun as runtime)
- Bun 1.3+ (recommended for package management and running scripts)

Install Bun if not already installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

## Project Structure

```
├── src/
│   ├── app/              # Angular application components
│   │   ├── demo/         # Demo component with feature cards
│   │   ├── home/         # Home component
│   │   └── *.spec.ts     # Bun test files
│   ├── assets/           # Static assets
│   ├── environments/     # Environment configurations
│   ├── types/            # TypeScript type definitions
│   ├── index.html        # Main HTML template
│   ├── main.ts           # Application entry point (standalone bootstrap)
│   ├── styles.css        # Global styles
│   └── test-setup.ts     # Test setup for Bun test (JSDOM + Angular)
├── e2e/                  # Playwright e2e tests
├── public/               # Public static assets (favicon, etc.)
├── angular.json          # Angular CLI configuration
├── rspack.config.js      # Rspack bundler configuration
├── bunfig.toml           # Bun runtime & test configuration
├── tsconfig.json         # TypeScript configuration
├── playwright.config.ts  # Playwright e2e configuration
├── biome.json            # Biome linter/formatter configuration
└── package.json          # Project dependencies and scripts
```

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd starter-angular-rspack
bun install
```

### Development Server

Start the development server with Rspack (recommended):

```bash
bun run dev
# or
bun run serve:rspack
```

Or use Angular CLI's webpack-based dev server:

```bash
bun run start
```

The application will be available at `http://localhost:4200` by default.

**Port Conflict Handling:** If port 4200 is already in use, the dev server will automatically find and use the next available port (4201, 4202, etc.). The actual port being used will be displayed in the console output.

### Production Build

Create a production build with Rspack:

```bash
bun run build:rspack
```

Or with Angular CLI (webpack):

```bash
bun run build
```

Output will be in the `dist/` directory.

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run start` | Start Angular CLI dev server (webpack) |
| `bun run dev` | Start Rspack dev server with HMR |
| `bun run serve:rspack` | Start Rspack dev server |
| `bun run build` | Production build with Angular CLI |
| `bun run build:rspack` | Production build with Rspack |
| `bun run test` | Run unit tests with Karma |
| `bun run lint` | Check code with Biome |
| `bun run lint:fix` | Auto-fix linting issues with Biome |
| `bun run format` | Check formatting with Biome |
| `bun run format:fix` | Auto-fix formatting with Biome |
| `bun run e2e` | Run e2e tests with Playwright |

## Configuration

### Rspack Configuration

The `rspack.config.js` file configures the Rspack bundler:

- Uses `esbuild-loader` for fast TypeScript compilation
- Configures `raw-loader` for HTML templates
- Processes CSS/SCSS with standard loaders
- Generates HTML with `html-rspack-plugin`
- Supports hot module replacement (HMR)
- Provides `global` polyfill for Angular compatibility
- Code splitting for vendor chunks

### Bun Configuration

The `bunfig.toml` file configures the Bun runtime:

- Defines script aliases
- Configures runtime behavior

### TypeScript Configuration

- `tsconfig.json` - Base TypeScript configuration for Angular 19
- `tsconfig.app.json` - Application-specific TypeScript settings
- `tsconfig.spec.json` - Test-specific TypeScript settings

### Angular CLI Configuration

The `angular.json` file maintains compatibility with traditional Angular CLI commands and webpack-based builds.

### Playwright Configuration

The `playwright.config.ts` file configures e2e testing:

- Multi-browser testing (Chromium, Firefox, WebKit)
- Automatic dev server startup
- HTML test reports

## Build System Comparison

### Rspack + Bun (Recommended for Development)

- Faster cold starts (Rust-based)
- Faster incremental builds
- Lower memory usage
- Hot module replacement enabled
- Webpack-compatible API

### Angular CLI + Webpack (Traditional)

- Full Angular CLI feature set
- More plugins and loaders available
- Better for complex custom configurations
- AOT compilation by default

## Key Dependencies

### Runtime Dependencies

- `@angular/*` (19.2.0) - Angular framework packages
- `rxjs` (7.8.x) - Reactive Extensions for JavaScript
- `zone.js` (0.15.x) - Zone.js for change detection
- `tslib` (2.6.x) - TypeScript runtime library
- `winbox` (0.2.x) - Window management library

### Development Dependencies

- `@rspack/core` (1.3.5) - Rspack bundler
- `@rspack/cli` (1.3.5) - Rspack CLI tools
- `@biomejs/biome` (2.4.2) - Linter and formatter
- `@playwright/test` (1.45+) - E2E testing framework
- `bun-types` (1.1+) - Bun type definitions
- `jsdom` (28+) - DOM simulation for unit tests
- `esbuild-loader` (4.4.2) - Fast TypeScript compilation
- `sass` (1.97.x) - SCSS/SASS preprocessor

## Code Quality

### Linting

This project uses Biome for linting and formatting, which is significantly faster than ESLint and Prettier.

Check for linting issues:

```bash
bun run lint
```

Auto-fix issues:

```bash
bun run lint:fix
```

### Formatting

Check formatting:

```bash
bun run format
```

Auto-fix formatting:

```bash
bun run format:fix
```

Biome configuration is in `biome.json`.

## Testing

### Unit Tests

Run unit tests with Bun test (ultra-fast):

```bash
bun run test
```

Watch mode for development:

```bash
bun run test:watch
```

With coverage:

```bash
bun run test:coverage
```

**Note:** Unit tests use JSDOM for DOM simulation. Tests focus on component logic rather than template rendering for optimal speed.

### E2E Tests

Run e2e tests with Playwright:

```bash
bun run e2e
```

For specific browser:

```bash
bun run e2e -- --project=chromium
```

View HTML test report:

```bash
npx playwright show-report
```

## Troubleshooting

### Clean Installation

If you encounter dependency issues:

```bash
rm -rf node_modules bun.lock
bun install
```

### Clear Build Cache

If builds are failing:

```bash
rm -rf dist
bun run build:rspack
```

### Check Versions

Verify tool versions:

```bash
bun --version    # Should be 1.3+
node --version   # Should be v18+
```

### Rspack-Specific Issues

If Rspack build fails but webpack succeeds:

1. Check `rspack.config.js` for loader compatibility
2. Ensure all required loaders are installed
3. Compare with `angular.json` webpack configuration

### Performance Issues

For large bundle sizes:

1. Enable production mode in Angular
2. Implement lazy loading for routes (already configured)
3. Analyze bundle:

```bash
bun run build:rspack --analyze
```

### WinBox Not Loading

If you see "WinBox is not loaded" errors:

1. Ensure `winbox` is installed: `bun install winbox`
2. Check that the import exists in `demo.component.ts`
3. Clear browser cache and reload

## License

This project is provided as-is for educational and starter purposes.
