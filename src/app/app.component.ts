import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorModalComponent } from './error-handling/error-modal.component';
import { WindowErrorHandler } from './error-handling/window-error-handler';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ErrorModalComponent],
  template: `
    <router-outlet></router-outlet>
    <app-error-modal></app-error-modal>
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'angular-rspack-demo';

  private windowErrorHandler = inject(WindowErrorHandler);

  ngOnInit(): void {
    // Initialize global error handling
    this.windowErrorHandler.init();
  }
}
