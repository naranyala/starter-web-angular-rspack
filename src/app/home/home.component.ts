import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import './home.component.css';

declare const WinBox: new (params: {
  title?: string;
  width?: number | string;
  height?: number | string;
  x?: number | string | 'center';
  y?: number | string | 'center';
  html?: string;
}) => { close: () => void };

interface Card {
  id: number;
  title: string;
  description: string;
  category: string;
  content?: string;
}

const CARDS: Card[] = [
  {
    id: 1,
    title: 'Accordion Component',
    description: 'Expandable panels with smooth animations',
    category: 'UI',
    content: '<p>Accordion content coming soon...</p>',
  },
  {
    id: 2,
    title: 'Data Table',
    description: 'Sortable and filterable data display',
    category: 'UI',
    content: '<p>Data Table content coming soon...</p>',
  },
  {
    id: 3,
    title: 'Modal Dialog',
    description: 'Overlay dialogs with backdrop',
    category: 'UI',
    content: '<p>Modal Dialog content coming soon...</p>',
  },
  {
    id: 4,
    title: 'Form Validation',
    description: 'Reactive forms with custom validators',
    category: 'Forms',
    content: '<p>Form Validation content coming soon...</p>',
  },
  {
    id: 5,
    title: 'HTTP Client',
    description: 'REST API communication layer',
    category: 'Data',
    content: '<p>HTTP Client content coming soon...</p>',
  },
  {
    id: 6,
    title: 'State Management',
    description: 'Signal-based reactive state',
    category: 'State',
    content: '<p>State Management content coming soon...</p>',
  },
  {
    id: 7,
    title: 'Routing',
    description: 'Navigation with guards and resolvers',
    category: 'Core',
    content: '<p>Routing content coming soon...</p>',
  },
  {
    id: 8,
    title: 'Testing',
    description: 'Unit and e2e testing utilities',
    category: 'DevOps',
    content: '<p>Testing content coming soon...</p>',
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="home-container">
      <h1>Angular Rspack Demo</h1>
      <p class="subtitle">A minimal Angular application bundled with Rspack</p>
      
      <div class="search-box">
        <input 
          type="text" 
          [ngModel]="searchQuery()" 
          (ngModelChange)="searchQuery.set($event)"
          placeholder="Search cards..."
          class="search-input"
        />
      </div>

      <div class="cards-grid">
        @for (card of filteredCards(); track card.id) {
          <div class="card" (click)="openWindow(card)">
            <span class="card-category">{{ card.category }}</span>
            <h3 class="card-title">{{ card.title }}</h3>
            <p class="card-description">{{ card.description }}</p>
          </div>
        } @empty {
          <p class="no-results">No cards found</p>
        }
      </div>
    </div>
  `,
})
export class HomeComponent {
  searchQuery = signal('');
  cards = signal(CARDS);

  filteredCards = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.cards();
    return this.cards().filter(
      (card) =>
        card.title.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query) ||
        card.category.toLowerCase().includes(query)
    );
  });

  openWindow(card: Card): void {
    new WinBox({
      title: card.title,
      width: 500,
      height: 400,
      x: 'center',
      y: 'center',
      html: `<div style="padding: 20px; font-family: system-ui, sans-serif;">
        <p style="color: #666; margin-bottom: 16px;">${card.description}</p>
        ${card.content || ''}
      </div>`,
    });
  }
}
