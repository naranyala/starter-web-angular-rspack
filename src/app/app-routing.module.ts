import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'demo',
    loadComponent: () => import('./demo/demo.component').then((m) => m.DemoComponent),
  },
];
