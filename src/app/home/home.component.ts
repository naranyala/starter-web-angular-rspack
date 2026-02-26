import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="home-container">
      <h1>Angular Rspack Demo</h1>
      <p class="subtitle">A minimal Angular 19 application bundled with Rspack</p>
      <a routerLink="/demo" class="btn">View Accordion Demo →</a>
    </div>
  `,
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {}
