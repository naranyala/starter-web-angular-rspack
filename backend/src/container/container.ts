export interface ServiceIdentifier<T = unknown> {
  name: string;
}

export interface Binding<T = unknown> {
  identifier: ServiceIdentifier<T>;
  resolve: () => T;
}

export class Container {
  private bindings = new Map<string, Binding>();
  private instances = new Map<string, unknown>();

  bind<T>(identifier: ServiceIdentifier<T>): BindingBuilder<T> {
    return new BindingBuilder<T>(this, identifier);
  }

  get<T>(identifier: ServiceIdentifier<T>): T {
    const binding = this.bindings.get(identifier.name);
    if (!binding) {
      throw new Error(`No binding found for ${identifier.name}`);
    }

    // Check if already cached (singleton)
    if (this.instances.has(identifier.name)) {
      return this.instances.get(identifier.name) as T;
    }

    const instance = binding.resolve();
    this.instances.set(identifier.name, instance);
    return instance;
  }

  private addBinding<T>(binding: Binding<T>): void {
    this.bindings.set(binding.identifier.name, binding);
  }
}

export class BindingBuilder<T> {
  constructor(
    private container: Container,
    private identifier: ServiceIdentifier<T>
  ) {}

  toFactory(factory: () => T): Container {
    this.container.addBinding({
      identifier: this.identifier,
      resolve: factory,
    });
    return this.container;
  }

  toConstantValue(value: T): Container {
    this.container.addBinding({
      identifier: this.identifier,
      resolve: () => value,
    });
    return this.container;
  }
}

// Helper to create service identifiers
export function createIdentifier<T>(name: string): ServiceIdentifier<T> {
  return { name };
}
