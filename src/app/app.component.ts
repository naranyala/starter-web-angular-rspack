import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import './app.component.css';
import { WinBoxPanelComponent } from './shared';
import { ErrorModalComponent } from './error-handling/error-modal.component';
import { WindowErrorHandler } from './error-handling/window-error-handler';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, WinBoxPanelComponent, ErrorModalComponent],
  template: `
    <app-winbox-panel></app-winbox-panel>
    <router-outlet></router-outlet>
    <!-- <app-devtools></app-devtools> -->
    <app-error-modal></app-error-modal>
  `,
})
export class AppComponent implements OnInit {
  title = 'angular-rspack-demo';

  private windowErrorHandler = inject(WindowErrorHandler);

  ngOnInit(): void {
    // Initialize global error handling
    this.windowErrorHandler.init();
  }
}
