import { describe, expect, test } from 'bun:test';
import {
  AutofocusDirective,
  DebounceClickDirective,
  HighlightDirective,
  RippleDirective,
} from './directives';

describe('HighlightDirective', () => {
  test('should be defined', () => {
    expect(HighlightDirective).toBeDefined();
  });

  test('should have correct selector', () => {
    const directive = (HighlightDirective as any).ɵdir;
    expect(directive).toBeDefined();
    expect(directive.selectors).toEqual([['', 'appHighlight', '']]);
  });

  test('should have inputs defined', () => {
    const directive = (HighlightDirective as any).ɵdir;
    expect(directive.inputs).toBeDefined();
    expect(directive.inputs.appHighlight).toBeDefined();
    expect(directive.inputs.defaultColor).toBeDefined();
  });

  test('should have host listeners', () => {
    const directive = (HighlightDirective as any).ɵdir;
    // Check for any host-related metadata
    const hasHostMetadata = !!(
      directive.hostListeners ||
      directive.hostBindingDef ||
      directive.hostBindings ||
      directive.HostBindings
    );
    expect(hasHostMetadata).toBe(true);
  });
});

describe('AutofocusDirective', () => {
  test('should be defined', () => {
    expect(AutofocusDirective).toBeDefined();
  });

  test('should have correct selector', () => {
    const directive = (AutofocusDirective as any).ɵdir;
    expect(directive).toBeDefined();
    expect(directive.selectors).toEqual([['', 'appAutofocus', '']]);
  });

  test('should have inputs defined', () => {
    const directive = (AutofocusDirective as any).ɵdir;
    expect(directive.inputs).toBeDefined();
    expect(directive.inputs.appAutofocus).toBeDefined();
  });
});

describe('DebounceClickDirective', () => {
  test('should be defined', () => {
    expect(DebounceClickDirective).toBeDefined();
  });

  test('should have correct selector', () => {
    const directive = (DebounceClickDirective as any).ɵdir;
    expect(directive).toBeDefined();
    expect(directive.selectors).toEqual([['', 'appDebounceClick', '']]);
  });

  test('should have inputs defined', () => {
    const directive = (DebounceClickDirective as any).ɵdir;
    expect(directive.inputs).toBeDefined();
    expect(directive.inputs.appDebounceClick).toBeDefined();
    expect(directive.inputs.disabled).toBeDefined();
  });

  test('should have host listeners', () => {
    const directive = (DebounceClickDirective as any).ɵdir;
    const hasHostMetadata = !!(
      directive.hostListeners ||
      directive.hostBindingDef ||
      directive.hostBindings ||
      directive.HostBindings
    );
    expect(hasHostMetadata).toBe(true);
  });
});

describe('RippleDirective', () => {
  test('should be defined', () => {
    expect(RippleDirective).toBeDefined();
  });

  test('should have correct selector', () => {
    const directive = (RippleDirective as any).ɵdir;
    expect(directive).toBeDefined();
    expect(directive.selectors).toEqual([['', 'appRipple', '']]);
  });

  test('should have inputs defined', () => {
    const directive = (RippleDirective as any).ɵdir;
    expect(directive.inputs).toBeDefined();
    expect(directive.inputs.appRipple).toBeDefined();
  });

  test('should have host listeners', () => {
    const directive = (RippleDirective as any).ɵdir;
    const hasHostMetadata = !!(
      directive.hostListeners ||
      directive.hostBindingDef ||
      directive.hostBindings ||
      directive.HostBindings
    );
    expect(hasHostMetadata).toBe(true);
  });
});

describe('Directives Integration', () => {
  test('should all be standalone', () => {
    expect((HighlightDirective as any).ɵdir.standalone).toBe(true);
    expect((AutofocusDirective as any).ɵdir.standalone).toBe(true);
    expect((DebounceClickDirective as any).ɵdir.standalone).toBe(true);
    expect((RippleDirective as any).ɵdir.standalone).toBe(true);
  });

  test('should have unique selectors', () => {
    const selectors = [
      (HighlightDirective as any).ɵdir.selectors[0][1],
      (AutofocusDirective as any).ɵdir.selectors[0][1],
      (DebounceClickDirective as any).ɵdir.selectors[0][1],
      (RippleDirective as any).ɵdir.selectors[0][1],
    ];
    const uniqueSelectors = new Set(selectors);
    expect(uniqueSelectors.size).toBe(selectors.length);
  });
});
