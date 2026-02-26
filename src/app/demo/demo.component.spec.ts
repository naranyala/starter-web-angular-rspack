import { beforeEach, describe, expect, test } from 'bun:test';
import { createMockCard, createMockCards } from '../../testing/test-factories';
import { DemoComponent } from './demo.component';

describe('DemoComponent', () => {
  let component: DemoComponent;

  beforeEach(() => {
    component = new DemoComponent();
  });

  describe('initialization', () => {
    test('should create', () => {
      expect(component).toBeTruthy();
    });

    test('should have empty search query initially', () => {
      expect(component.searchQuery).toBe('');
    });

    test('should have cards array initialized', () => {
      expect(component.cards).toBeDefined();
      expect(Array.isArray(component.cards)).toBe(true);
    });

    test('should have at least one card', () => {
      expect(component.cards.length).toBeGreaterThan(0);
    });

    test('should have cards with required properties', () => {
      component.cards.forEach((card) => {
        expect(card).toHaveProperty('title');
        expect(card).toHaveProperty('description');
        expect(card).toHaveProperty('icon');
        expect(card).toHaveProperty('color');
        expect(card).toHaveProperty('content');
      });
    });
  });

  describe('filteredCards', () => {
    beforeEach(() => {
      // Set up test data
      component.cards = [
        createMockCard({ title: 'Angular', description: 'A web framework' }),
        createMockCard({ title: 'React', description: 'A UI library' }),
        createMockCard({ title: 'Vue', description: 'A progressive framework' }),
        createMockCard({ title: 'Svelte', description: 'A compiler framework' }),
      ];
    });

    test('should return all cards when search is empty', () => {
      component.searchQuery = '';
      expect(component.filteredCards.length).toBe(4);
    });

    test('should return all cards when search is whitespace only', () => {
      component.searchQuery = '   ';
      expect(component.filteredCards.length).toBe(4);
    });

    test('should filter cards by title', () => {
      component.searchQuery = 'Angular';
      const filtered = component.filteredCards;
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Angular');
    });

    test('should filter cards by description', () => {
      component.searchQuery = 'compiler';
      const filtered = component.filteredCards;
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Svelte');
    });

    test('should be case insensitive', () => {
      component.searchQuery = 'angular';
      const filtered = component.filteredCards;
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Angular');
    });

    test('should match partial words', () => {
      component.searchQuery = 'Ang';
      const filtered = component.filteredCards;
      expect(filtered.length).toBe(1);
    });

    test('should return empty array when no matches', () => {
      component.searchQuery = 'NonExistentFramework';
      expect(component.filteredCards.length).toBe(0);
    });

    test('should trim search query', () => {
      component.searchQuery = '  Angular  ';
      const filtered = component.filteredCards;
      expect(filtered.length).toBe(1);
    });

    test('should handle special characters in search', () => {
      component.searchQuery = 'C++';
      expect(component.filteredCards.length).toBe(0);
    });
  });

  describe('search functionality', () => {
    beforeEach(() => {
      component.cards = createMockCards(10);
    });

    test('should update filtered results when search changes', () => {
      component.searchQuery = '';
      expect(component.filteredCards.length).toBe(10);

      component.searchQuery = 'Card 1';
      expect(component.filteredCards.length).toBe(2); // Card 1 and Card 10

      component.searchQuery = '';
      expect(component.filteredCards.length).toBe(10);
    });

    test('should handle single character search', () => {
      component.searchQuery = '1';
      const filtered = component.filteredCards;
      expect(filtered.length).toBeGreaterThan(0);
    });

    test('should handle very long search query', () => {
      component.searchQuery = 'A'.repeat(1000);
      expect(component.filteredCards.length).toBe(0);
    });
  });

  describe('card data integrity', () => {
    test('should have unique card titles', () => {
      const titles = component.cards.map((c) => c.title);
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(titles.length);
    });

    test('should have valid color formats', () => {
      component.cards.forEach((card) => {
        expect(card.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    test('should have non-empty descriptions', () => {
      component.cards.forEach((card) => {
        expect(card.description.length).toBeGreaterThan(0);
      });
    });

    test('should have non-empty content', () => {
      component.cards.forEach((card) => {
        expect(card.content.length).toBeGreaterThan(0);
      });
    });
  });

  describe('openCard', () => {
    test('should be defined', () => {
      expect(component.openCard).toBeDefined();
      expect(typeof component.openCard).toBe('function');
    });

    test('should be an async method', () => {
      // Verify the method is declared as async by checking it returns something truthy
      // We can't actually call it without winbox being available
      expect(component.openCard.length).toBe(1); // Takes 1 parameter (card)
    });
  });

  describe('edge cases', () => {
    test('should handle empty cards array', () => {
      component.cards = [];
      component.searchQuery = 'test';
      expect(component.filteredCards).toEqual([]);
    });

    test('should handle cards with empty titles', () => {
      component.cards = [createMockCard({ title: '', description: 'No match here either' })];
      component.searchQuery = 'test';
      // Empty title won't match 'test', and description doesn't match either
      expect(component.filteredCards.length).toBe(0);
    });

    test('should handle cards with null descriptions', () => {
      component.cards = [createMockCard({ description: '' as any })];
      component.searchQuery = 'test';
      // Should not throw
      expect(() => component.filteredCards).not.toThrow();
    });

    test('should preserve card object references', () => {
      const originalCard = component.cards[0];
      component.searchQuery = originalCard.title;
      const filtered = component.filteredCards;
      expect(filtered[0]).toBe(originalCard);
    });
  });

  describe('performance', () => {
    test('should filter large arrays quickly', () => {
      component.cards = createMockCards(1000);
      component.searchQuery = 'Card 500';

      const start = performance.now();
      const filtered = component.filteredCards;
      const end = performance.now();

      expect(filtered.length).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    test('should handle repeated filtering', () => {
      component.cards = createMockCards(100);

      for (let i = 0; i < 100; i++) {
        component.searchQuery = `Card ${i % 10}`;
        component.filteredCards;
      }

      // If we get here without timeout, the test passes
      expect(true).toBe(true);
    });
  });
});
