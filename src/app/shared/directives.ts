import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';

/**
 * Highlight directive - highlights text content
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnInit {
  @Input() appHighlight = 'yellow';
  @Input() defaultColor = 'transparent';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.highlight(this.appHighlight);
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.highlight(this.appHighlight);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.highlight(this.defaultColor);
  }

  private highlight(color: string): void {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'background-color 0.3s ease');
  }
}

/**
 * Auto-focus directive - focuses element on init
 */
@Directive({
  selector: '[appAutofocus]',
  standalone: true,
})
export class AutofocusDirective implements OnInit {
  @Input() appAutofocus = true;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if (this.appAutofocus) {
      this.el.nativeElement.focus();
    }
  }
}

/**
 * Debounce click directive - prevents rapid clicks
 */
@Directive({
  selector: '[appDebounceClick]',
  standalone: true,
})
export class DebounceClickDirective {
  @Input() appDebounceClick = 300;
  @Input() disabled = false;

  private isDebouncing = false;

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.disabled || this.isDebouncing) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.isDebouncing = true;
    setTimeout(() => {
      this.isDebouncing = false;
    }, this.appDebounceClick);
  }
}

/**
 * Ripple effect directive
 */
@Directive({
  selector: '[appRipple]',
  standalone: true,
})
export class RippleDirective {
  @Input() appRipple = 'rgba(0, 0, 0, 0.1)';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const ripple = this.renderer.createElement('span');
    const rect = this.el.nativeElement.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${x}px`);
    this.renderer.setStyle(ripple, 'top', `${y}px`);
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'borderRadius', '50%');
    this.renderer.setStyle(ripple, 'backgroundColor', this.appRipple);
    this.renderer.setStyle(ripple, 'transform', 'scale(0)');
    this.renderer.setStyle(ripple, 'animation', 'ripple 0.6s ease-out');
    this.renderer.setStyle(ripple, 'pointerEvents', 'none');

    this.renderer.appendChild(this.el.nativeElement, ripple);

    setTimeout(() => {
      this.renderer.removeChild(this.el.nativeElement, ripple);
    }, 600);
  }
}
