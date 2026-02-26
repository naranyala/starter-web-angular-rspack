import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { DevtoolsComponentInfo } from '../devtools.service';

@Component({
  selector: 'app-component-tree-node',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tree-node" [class.match]="isMatch()">
      <div class="node-header" (click)="toggle()">
        <span class="expand-icon" [class.expanded]="expanded()">
          {{ hasChildren() ? '▶' : '•' }}
        </span>
        <span class="component-icon">🧩</span>
        <span class="component-name">{{ component.name }}</span>
        <span class="component-selector" *ngIf="component.selector">
          &lt;{{ component.selector }}&gt;
        </span>
        <span class="component-badge" *ngIf="component.standalone">standalone</span>
      </div>

      @if (expanded() && component.children && component.children.length > 0) {
        <div class="node-children">
          @for (child of component.children; track child.name) {
            <app-component-tree-node
              [component]="child"
              [searchQuery]="searchQuery"
              [expandedByDefault]="expandedByDefault">
            </app-component-tree-node>
          }
        </div>
      }

      @if (expanded() && hasInputs()) {
        <div class="node-inputs">
          <div class="inputs-header">
            <span class="inputs-label">Inputs:</span>
          </div>
          @for (input of getInputs(); track input.key) {
            <div class="input-row">
              <span class="input-key">{{ input.key }}:</span>
              <span class="input-value">{{ formatValue(input.value) }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
    .tree-node {
      margin: 0;
    }

    .tree-node.match {
      background: rgba(229, 53, 171, 0.2);
      border-radius: 4px;
    }

    .node-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.15s;
    }

    .node-header:hover {
      background: #2d2d30;
    }

    .expand-icon {
      font-size: 10px;
      color: #858585;
      width: 16px;
      text-align: center;
      transition: transform 0.2s;
      display: inline-block;
    }

    .expand-icon.expanded {
      transform: rotate(90deg);
    }

    .component-icon {
      font-size: 14px;
    }

    .component-name {
      color: #4ec9b0;
      font-size: 13px;
      font-weight: 500;
    }

    .component-selector {
      color: #858585;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
    }

    .component-badge {
      background: #e535ab;
      color: #fff;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: 600;
    }

    .node-children {
      margin-left: 24px;
      border-left: 1px solid #333;
    }

    .node-inputs {
      margin: 8px 0 8px 40px;
      padding: 8px;
      background: #2d2d30;
      border-radius: 4px;
      font-size: 11px;
    }

    .inputs-header {
      margin-bottom: 6px;
    }

    .inputs-label {
      color: #858585;
      font-weight: 600;
    }

    .input-row {
      display: flex;
      gap: 8px;
      padding: 4px 0;
    }

    .input-key {
      color: #9cdcfe;
      min-width: 100px;
      font-family: 'Consolas', 'Monaco', monospace;
    }

    .input-value {
      color: #ce9178;
      word-break: break-all;
    }
  `,
  ],
})
export class ComponentTreeNodeComponent {
  @Input() component: DevtoolsComponentInfo = {} as DevtoolsComponentInfo;
  @Input() searchQuery = '';
  @Input() expandedByDefault = false;

  expanded = signal(this.expandedByDefault);

  hasChildren(): boolean {
    return this.component.children && this.component.children.length > 0;
  }

  isMatch(): boolean {
    if (!this.searchQuery) return false;
    const query = this.searchQuery.toLowerCase();
    return (
      this.component.name.toLowerCase().includes(query) ||
      this.component.selector?.toLowerCase().includes(query)
    );
  }

  toggle(): void {
    if (this.hasChildren()) {
      this.expanded.update((v) => !v);
    }
  }

  hasInputs(): boolean {
    const inputs = this.getInputs();
    return inputs.length > 0;
  }

  getInputs(): { key: string; value: any }[] {
    if (!this.component.inputs) return [];
    return Object.entries(this.component.inputs)
      .filter(([key]) => !key.startsWith('_') && key !== 'constructor')
      .map(([key, value]) => ({ key, value }));
  }

  formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'function') return 'ƒ';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).slice(0, 50);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  }
}
