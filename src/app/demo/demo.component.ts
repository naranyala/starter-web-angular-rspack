import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface CardItem {
  title: string;
  description: string;
  icon: string;
  color: string;
  content: string;
  link?: string;
}

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css'],
})
export class DemoComponent {
  searchQuery = '';

  cards: CardItem[] = [
    {
      title: 'Angular',
      description:
        'A platform for building mobile and desktop web applications with TypeScript and component-based architecture.',
      icon: '🅰️',
      color: '#e535ab',
      content: `
        <h2>Angular</h2>
        <p>Angular is a development platform, built on TypeScript, which includes:</p>
        <ul>
          <li>A component-based framework for building scalable web applications</li>
          <li>A collection of well-integrated libraries that include features like routing, forms management, and client-server communication</li>
          <li>A suite of developer tools to help you develop, build, test, and update your app</li>
        </ul>
        <p><strong>Version:</strong> 19.x</p>
        <p><strong>Language:</strong> TypeScript</p>
      `,
      link: 'https://angular.dev',
    },
    {
      title: 'Rspack',
      description:
        'A high-performance JavaScript bundler written in Rust. Offers faster builds than traditional bundlers.',
      icon: '⚡',
      color: '#f5a623',
      content: `
        <h2>Rspack</h2>
        <p>Rspack is a high performance JavaScript bundler written in Rust. It provides:</p>
        <ul>
          <li>Lightning fast cold starts</li>
          <li>Incremental compilation</li>
          <li>Built-in support for loaders and plugins</li>
          <li>Webpack compatibility</li>
        </ul>
        <p><strong>Written in:</strong> Rust</p>
        <p><strong>Speed:</strong> 10x faster than Webpack</p>
      `,
      link: 'https://rspack.dev',
    },
    {
      title: 'Bun',
      description:
        'An all-in-one JavaScript runtime, package manager, and build tool. A faster alternative to Node.js.',
      icon: '🥟',
      color: '#fbf0df',
      content: `
        <h2>Bun</h2>
        <p>Bun is an all-in-one toolkit for JavaScript and TypeScript apps:</p>
        <ul>
          <li>Runtime - A JavaScript runtime built on JavaScriptCore</li>
          <li>Package Manager - A drop-in replacement for npm</li>
          <li>Bundler - A fast bundler for JavaScript and TypeScript</li>
          <li>Test Runner - A fast test runner with Jest-compatible API</li>
        </ul>
        <p><strong>Speed:</strong> 3x faster than Node.js</p>
      `,
      link: 'https://bun.sh',
    },
    {
      title: 'TypeScript',
      description:
        'A typed superset of JavaScript that compiles to plain JavaScript. Adds static types to the language.',
      icon: '📘',
      color: '#3178c6',
      content: `
        <h2>TypeScript</h2>
        <p>TypeScript is a strongly typed programming language that builds on JavaScript:</p>
        <ul>
          <li>Static type checking</li>
          <li>Enhanced IDE support</li>
          <li>Modern JavaScript features</li>
          <li>Compiles to clean JavaScript</li>
        </ul>
        <p><strong>Version:</strong> 5.x</p>
        <p><strong>Developed by:</strong> Microsoft</p>
      `,
      link: 'https://typescriptlang.org',
    },
    {
      title: 'esbuild',
      description:
        'An extremely fast JavaScript bundler and minifier. Used here for compiling TypeScript.',
      icon: '🚀',
      color: '#ffcf00',
      content: `
        <h2>esbuild</h2>
        <p>esbuild is an extremely fast JavaScript bundler and minifier:</p>
        <ul>
          <li>10-100x faster than other bundlers</li>
          <li>Written in Go</li>
          <li>Supports TypeScript and JSX out of the box</li>
          <li>Used by Vite, Remix, and more</li>
        </ul>
        <p><strong>Written in:</strong> Go</p>
        <p><strong>Speed:</strong> Up to 100x faster</p>
      `,
      link: 'https://esbuild.github.io',
    },
    {
      title: 'HMR',
      description:
        'Hot Module Replacement enables instant updates during development without page refresh.',
      icon: '🔥',
      color: '#ff6b6b',
      content: `
        <h2>Hot Module Replacement</h2>
        <p>HMR exchanges, adds, or removes modules while an application is running:</p>
        <ul>
          <li>Preserve application state</li>
          <li>Instant feedback on changes</li>
          <li>No full page reload</li>
          <li>Faster development cycle</li>
        </ul>
        <p><strong>Supported by:</strong> Angular, Vite, Webpack, Rspack</p>
      `,
    },
  ];

  get filteredCards(): CardItem[] {
    if (!this.searchQuery.trim()) {
      return this.cards;
    }

    const query = this.searchQuery.toLowerCase().trim();
    return this.cards.filter(
      (card) =>
        card.title.toLowerCase().includes(query) || card.description.toLowerCase().includes(query)
    );
  }

  openCard(card: CardItem): void {
    const WinBoxConstructor = (window as unknown as { WinBox: any }).WinBox;
    if (!WinBoxConstructor) {
      console.error('WinBox is not loaded. Please check if winbox.bundle.min.js is included.');
      return;
    }
    const _win = new WinBoxConstructor({
      title: card.title,
      background: card.color,
      width: '600px',
      height: '500px',
      x: 'center',
      y: 'center',
      html: `
        <div style="padding: 20px; color: #333; height: 100%; overflow: auto; background: white;">
          ${card.content}
          ${
            card.link
              ? `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <a href="${card.link}" target="_blank" style="color: ${card.color}; text-decoration: none; font-weight: 500;">
                Visit ${card.title} Website →
              </a>
            </div>
          `
              : ''
          }
        </div>
      `,
      onfocus: function () {
        this.setBackground(card.color);
      },
    });
  }
}
