import { describe, expect, test } from 'bun:test';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  test('should create', () => {
    const component = new HomeComponent();
    expect(component).toBeTruthy();
  });
});
