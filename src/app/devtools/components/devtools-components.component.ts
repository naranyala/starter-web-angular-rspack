import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { DevtoolsComponentInfo } from '../devtools.service';
import { ComponentTreeNodeComponent } from './component-tree-node.component';

@Component({
  selector: 'app-devtools-components',
  standalone: true,
  imports: [CommonModule, FormsModule, ComponentTreeNodeComponent],
  template: `
    <div class="components-container">
      <div class="components-header">
        <h2>Component Tree</h2>
        <div class="header-actions">
          <input
            type="text"
            class="search-input"
            placeholder="Search components..."
            [(ngModel)]="searchQuery"
          />
          <button class="expand-btn" (click)="expandAll()">Expand All</button>
          <button class="collapse-btn" (click)="collapseAll()">Collapse All</button>
        </div>
      </div>

      <div class="components-tree">
        @if (componentTree && componentTree.length > 0) {
          @for (component of componentTree; track component.name) {
            <app-component-tree-node
              [component]="component"
              [searchQuery]="searchQuery()"
              [expandedByDefault]="expandedAll()">
            </app-component-tree-node>
          }
        } @else {
          <div class="empty-state">
            <span class="empty-icon">🌲</span>
            <p>No components found</p>
            <span class="empty-hint">Component tree inspection requires Angular dev mode</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
    .components-container {
      padding: 16px;
    }

    .components-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .components-header h2 {
      color: #fff;
      font-size: 18px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .search-input {
      padding: 6px 12px;
      background: #2d2d30;
      border: 1px solid #333;
      border-radius: 4px;
      color: #fff;
      font-size: 13px;
      width: 200px;
    }

    .search-input:focus {
      outline: none;
      border-color: #007acc;
    }

    .expand-btn, .collapse-btn {
      padding: 6px 12px;
      background: #2d2d30;
      border: 1px solid #333;
      border-radius: 4px;
      color: #fff;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .expand-btn:hover {
      background: #0f3460;
    }

    .collapse-btn:hover {
      background: #3d3d3d;
    }

    .components-tree {
      background: #252526;
      border-radius: 6px;
      padding: 12px;
      min-height: 200px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #858585;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state p {
      font-size: 16px;
      margin: 0 0 8px;
    }

    .empty-hint {
      font-size: 12px;
      opacity: 0.7;
    }
  `,
  ],
})
export class DevtoolsComponentsComponent {
  @Input() componentTree: DevtoolsComponentInfo[] = [];
  searchQuery = signal('');
  expandedAll = signal(false);

  expandAll(): void {
    this.expandedAll.set(true);
  }

  collapseAll(): void {
    this.expandedAll.set(false);
  }
}
