import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AutofocusDirective,
  DebounceClickDirective,
  HighlightDirective,
  RippleDirective,
} from './directives';
import { CurrencyPipe, FilterByPipe, SortByPipe, TitleCasePipe, TruncatePipe } from './pipes';

/**
 * Shared dependencies array for easy importing in standalone components.
 * Include this in your component's imports array to get all common directives and pipes.
 *
 * @example
 * ```ts
 * @Component({
 *   standalone: true,
 *   imports: [sharedDeps, RouterOutlet],
 * })
 * ```
 */
export const sharedDeps = [
  CommonModule,
  FormsModule,
  HighlightDirective,
  AutofocusDirective,
  DebounceClickDirective,
  RippleDirective,
  CurrencyPipe,
  TruncatePipe,
  FilterByPipe,
  SortByPipe,
  TitleCasePipe,
];
