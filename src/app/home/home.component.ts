import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WinBoxWindowService } from '../shared/winbox-window.service';
import './home.component.css';

interface Card {
  id: number;
  title: string;
  description: string;
  category: string;
  content?: string;
}

const CARDS: Card[] = [
  {
    id: 1,
    title: 'Accordion Component',
    description: 'Expandable panels with smooth animations',
    category: 'UI',
    content: `
      <h3>Accordion Component</h3>
      <p>A flexible accordion component with smooth animations.</p>
      
      <h4>Component Template</h4>
      <pre><code class="language-html">&lt;div class="accordion"&gt;
  @for (item of items(); track item.id) {
    &lt;div class="accordion-item" [class.expanded]="item.expanded()"&gt;
      &lt;button 
        class="accordion-header"
        (click)="toggleItem(item)"
        [attr.aria-expanded]="item.expanded()"&gt;
        {{ item.title }}
        &lt;span class="accordion-icon"&gt;▼&lt;/span&gt;
      &lt;/button&gt;
      &lt;div class="accordion-content" [@expandCollapse]="item.expanded()"&gt;
        &lt;ng-content [select]="accordionContent"&gt;&lt;/ng-content&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  }
&lt;/div&gt;</code></pre>

      <h4>Component CSS</h4>
      <pre><code class="language-css">.accordion {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.accordion-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.accordion-header {
  width: 100%;
  padding: 16px 20px;
  background: #f5f5f5;
  border: none;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accordion-content {
  overflow: hidden;
  transition: max-height 0.3s ease;
}</code></pre>

      <h4>Features</h4>
      <ul>
        <li>Smooth expand/collapse animations</li>
        <li>Supports multiple items</li>
        <li>Customizable headers</li>
        <li>Keyboard navigation</li>
      </ul>
    `,
  },
  {
    id: 2,
    title: 'Data Table',
    description: 'Sortable and filterable data display',
    category: 'UI',
    content: `
      <h3>Data Table Component</h3>
      <p>A powerful data table with sorting, filtering, and pagination.</p>
      
      <h4>Component Template</h4>
      <pre><code class="language-html">&lt;div class="data-table-container"&gt;
  &lt;div class="table-filters"&gt;
    &lt;input 
      type="text" 
      [ngModel]="filter()"
      (ngModelChange)="filter.set($event)"
      placeholder="Search..."
      class="filter-input" /&gt;
  &lt;/div&gt;
  
  &lt;table class="data-table"&gt;
    &lt;thead&gt;
      &lt;tr&gt;
        @for (col of columns; track col.key) {
          &lt;th 
            (click)="sort(col.key)"
            [class.sorted]="sortKey() === col.key"&gt;
            {{ col.header }}
            &lt;span class="sort-icon"&gt;{{ getSortIcon(col.key) }}&lt;/span&gt;
          &lt;/th&gt;
        }
      &lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody&gt;
      @for (row of paginatedData(); track row.id) {
        &lt;tr&gt;
          @for (col of columns; track col.key) {
            &lt;td&gt;{{ row[col.key] }}&lt;/td&gt;
          }
        &lt;/tr&gt;
      }
    &lt;/tbody&gt;
  &lt;/table&gt;
  
  &lt;app-pagination 
    [currentPage]="currentPage()"
    [totalPages]="totalPages()"
    (pageChange)="onPageChange($event)" /&gt;
&lt;/div&gt;</code></pre>

      <h4>Component CSS</h4>
      <pre><code class="language-css">.data-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f5f5f5;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.data-table tr:hover td {
  background: #f9f9f9;
}</code></pre>

      <h4>Features</h4>
      <ul>
        <li>Column sorting (asc/desc)</li>
        <li>Global and column filtering</li>
        <li>Pagination support</li>
        <li>Row selection</li>
        <li>Responsive design</li>
      </ul>
    `,
  },
  {
    id: 3,
    title: 'Modal Dialog',
    description: 'Overlay dialogs with backdrop',
    category: 'UI',
    content: `
      <h3>Modal Dialog Component</h3>
      <p>Reusable modal dialogs with backdrop and animations.</p>
      
      <h4>Component Template</h4>
      <pre><code class="language-html">@if (isOpen()) {
  &lt;div class="modal-backdrop" (click)="onBackdropClick()"&gt;
    &lt;div 
      class="modal-container" 
      [@modalAnimation]
      (click)="$event.stopPropagation()"&gt;
      
      &lt;div class="modal-header"&gt;
        &lt;h2 class="modal-title"&gt;&lt;ng-content select="[modal-title]"&gt;&lt;/ng-content&gt;&lt;/h2&gt;
        &lt;button class="modal-close" (click)="close()"&gt;×&lt;/button&gt;
      &lt;/div&gt;
      
      &lt;div class="modal-body"&gt;
        &lt;ng-content select="[modal-body]"&gt;&lt;/ng-content&gt;
      &lt;/div&gt;
      
      &lt;div class="modal-footer"&gt;
        &lt;ng-content select="[modal-footer]"&gt;&lt;/ng-content&gt;
      &lt;/div&gt;
      
    &lt;/div&gt;
  &lt;/div&gt;
}</code></pre>

      <h4>Component CSS</h4>
      <pre><code class="language-css">.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}</code></pre>

      <h4>Features</h4>
      <ul>
        <li>Backdrop with click-to-close</li>
        <li>Keyboard escape support</li>
        <li>Custom content projection</li>
        <li>Animation support</li>
      </ul>
    `,
  },
  {
    id: 4,
    title: 'Form Validation',
    description: 'Reactive forms with custom validators',
    category: 'Forms',
    content: `
      <h3>Form Validation</h3>
      <p>Reactive forms with built-in and custom validators.</p>
      
      <h4>Component Template</h4>
      <pre><code class="language-html">&lt;form [formGroup]="form" (ngSubmit)="onSubmit()" class="validated-form"&gt;
  &lt;div class="form-field"&gt;
    &lt;label for="email"&gt;Email&lt;/label&gt;
    &lt;input 
      id="email"
      type="email"
      formControlName="email"
      [class.invalid]="form.controls.email.invalid && form.controls.email.touched" /&gt;
    @if (form.controls.email.invalid && form.controls.email.touched) {
      &lt;span class="error-message"&gt;
        @if (form.controls.email.errors?.['required']) {
          Email is required
        }
        @if (form.controls.email.errors?.['email']) {
          Invalid email format
        }
      &lt;/span&gt;
    }
  &lt;/div&gt;
  
  &lt;div class="form-field"&gt;
    &lt;label for="password"&gt;Password&lt;/label&gt;
    &lt;input 
      id="password"
      type="password"
      formControlName="password" /&gt;
    &lt;span class="error-message" *ngIf="form.controls.password.errors?.['minlength']"&gt;
      Password must be at least 8 characters
    &lt;/span&gt;
  &lt;/div&gt;
  
  &lt;button type="submit" [disabled]="form.invalid"&gt;Submit&lt;/button&gt;
&lt;/form&gt;</code></pre>

      <h4>Component CSS</h4>
      <pre><code class="language-css">.validated-form {
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-weight: 600;
  color: #333;
}

.form-field input {
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.form-field input.invalid {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
}</code></pre>

      <h4>Features</h4>
      <ul>
        <li>Built-in validators</li>
        <li>Custom async validators</li>
        <li>Error message display</li>
        <li>Dynamic validation</li>
      </ul>
    `,
  },
  {
    id: 5,
    title: 'HTTP Client',
    description: 'REST API communication layer',
    category: 'Data',
    content: `
      <h3>HTTP Client Service</h3>
      <p>Typed HTTP client with interceptors and error handling.</p>
      
      <h4>Service Template</h4>
      <pre><code class="language-typescript">@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = '/api';
  
  getUsers(params?: UserFilters): Observable&lt;User[]&gt; {
    return this.http.get&lt;User[]&gt;(\`\${this.apiUrl}/users\`, { params });
  }
  
  getUserById(id: number): Observable&lt;User&gt; {
    return this.http.get&lt;User&gt;(\`\${this.apiUrl}/users/\${id}\`);
  }
  
  createUser(user: CreateUserDto): Observable&lt;User&gt; {
    return this.http.post&lt;User&gt;(\`\${this.apiUrl}/users\`, user);
  }
  
  updateUser(id: number, user: UpdateUserDto): Observable&lt;User&gt; {
    return this.http.put&lt;User&gt;(\`\${this.apiUrl}/users/\${id}\`, user);
  }
  
  deleteUser(id: number): Observable&lt;void&gt; {
    return this.http.delete&lt;void&gt;(\`\${this.apiUrl}/users/\${id}\`);
  }
}</code></pre>

      <h4>Interceptor Template</h4>
      <pre><code class="language-typescript">@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest&lt;any&gt;, next: HttpHandler): Observable&lt;HttpEvent&lt;any&gt;&gt; {
    const authReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) =&gt; {
        console.error('HTTP Error:', error.status, error.message);
        return throwError(() =&gt; error);
      })
    );
  }
}</code></pre>

      <h4>Features</h4>
      <ul>
        <li>Typed responses</li>
        <li>Request/Response interceptors</li>
        <li>Error handling</li>
        <li>Retry logic</li>
      </ul>
    `,
  },
  {
    id: 6,
    title: 'State Management',
    description: 'Signal-based reactive state',
    category: 'State',
    content: `
      <h3>State Management with Signals</h3>
      <p>Modern reactive state using Angular signals.</p>
      
      <h4>Store Template</h4>
      <pre><code class="language-typescript">@Injectable({ providedIn: 'root' })
export class UserStore {
  private userService = inject(UserService);
  
  private users = signal&lt;User[]&gt;([]);
  private loading = signal(false);
  private error = signal&lt;string | null&gt;(null);
  
  // Computed signals
  readonly usersList = computed(() =&gt; this.users());
  readonly isLoading = computed(() =&gt; this.loading());
  readonly hasError = computed(() =&gt; this.error() !== null);
  readonly sortedUsers = computed(() =&gt; 
    [...this.users()].sort((a, b) =&gt; a.name.localeCompare(b.name))
  );
  
  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.userService.getAll().subscribe({
      next: (users) =&gt; this.users.set(users),
      error: (err) =&gt; this.error.set(err.message),
      complete: () =&gt; this.loading.set(false)
    });
  }
}</code></pre>

      <h4>Component Template</h4>
      <pre><code class="language-typescript">@Component({
  selector: 'app-user-list',
  template: \`
    &lt;div class="user-list"&gt;
      @if (store.isLoading()) {
        &lt;app-spinner /&gt;
      } @else if (store.hasError()) {
        &lt;app-error [message]="store.error()" /&gt;
      } @else {
        &lt;ul&gt;
          @for (user of store.sortedUsers(); track user.id) {
            &lt;li&gt;{{ user.name }} - {{ user.email }}&lt;/li&gt;
          }
        &lt;/ul&gt;
      }
    &lt;/div&gt;
  \`
})
export class UserListComponent {
  store = inject(UserStore);
}</code></pre>

      <h4>Features</h4>
      <ul>
        <li>Reactive signals</li>
        <li>Computed values</li>
        <li>Effects for side effects</li>
        <li>Type-safe state</li>
      </ul>
    `,
  },
  {
    id: 7,
    title: 'Routing',
    description: 'Navigation with guards and resolvers',
    category: 'Core',
    content: `
      <h3>Routing Configuration</h3>
      <p>Advanced routing with guards, resolvers, and lazy loading.</p>
      
      <h4>Routes Template</h4>
      <pre><code class="language-typescript">export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =&gt; import('./dashboard/dashboard.component')
      .then(m =&gt; m.DashboardComponent),
    canActivate: [AuthGuard],
    title: 'Dashboard'
  },
  {
    path: 'products',
    loadComponent: () =&gt; import('./products/products.component')
      .then(m =&gt; m.ProductsComponent),
    children: [
      { 
        path: ':id',
        loadComponent: () =&gt; import('./product-detail/product-detail.component')
          .then(m =&gt; m.ProductDetailComponent),
        resolve: { product: ProductResolver },
        canActivate: [ProductAccessGuard]
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =&gt; import('./not-found/not-found.component')
      .then(m =&gt; m.NotFoundComponent)
  }
];</code></pre>

      <h4>Guard Template</h4>
      <pre><code class="language-typescript">@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class ProductResolver implements Resolve&lt;Product&gt; {
  private productService = inject(ProductService);
  
  resolve(route: ActivatedRouteSnapshot): Observable&lt;Product&gt; {
    const id = route.paramMap.get('id')!;
    return this.productService.getById(id);
  }
}</code></pre>

      <h4>Features</h4>
      <ul>
        <li>Route guards (CanActivate, CanDeactivate)</li>
        <li>Resolvers for pre-fetching data</li>
        <li>Lazy loading</li>
        <li>Nested routes</li>
      </ul>
    `,
  },
  {
    id: 8,
    title: 'Testing',
    description: 'Unit and e2e testing utilities',
    category: 'DevOps',
    content: `
      <h3>Testing Utilities</h3>
      <p>Comprehensive testing setup for Angular applications.</p>
      
      <h4>Unit Test Template</h4>
      <pre><code class="language-typescript">describe('UserService', () =&gt; {
  let service: UserService;
  let httpMock: HttpTestingController;
  
  beforeEach(() =&gt; {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() =&gt; {
    httpMock.verify();
  });
  
  it('should fetch users', () =&gt; {
    const mockUsers = [{ id: 1, name: 'John' }];
    
    service.getUsers().subscribe(users =&gt; {
      expect(users.length).toBe(1);
      expect(users[0].name).toBe('John');
    });
    
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });
});</code></pre>

      <h4>Component Test Template</h4>
      <pre><code class="language-typescript">describe('UserListComponent', () =&gt; {
  let fixture: ComponentFixture&lt;UserListComponent&gt;;
  let component: UserListComponent;
  
  beforeEach(async () =&gt; {
    await TestBed.configureTestingModule({
      imports: [
        UserListComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideMockStore({
          initialState: { users: { list: [] } }
        })
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () =&gt; {
    expect(component).toBeTruthy();
  });
  
  it('should display users', () =&gt; {
    const mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(SelectorService.getUsers, [
      { id: 1, name: 'John' }
    ]);
    mockStore.refreshState();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.user-item')).toBeTruthy();
  });
});</code></pre>

      <h4>Features</h4>
      <ul>
        <li>Jest/Bun test runner</li>
        <li>Testing Library support</li>
        <li>Playwright for E2E</li>
        <li>Mock utilities</li>
      </ul>
    `,
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="home-container">
      <h1>Angular Rspack Demo</h1>
      <p class="subtitle">A minimal Angular application bundled with Rspack</p>

      <div class="search-box">
        <input
          type="text"
          [ngModel]="searchQuery()"
          (ngModelChange)="searchQuery.set($event)"
          placeholder="Search components..."
          class="search-input"
        />
      </div>

      <div class="cards-list">
        @for (card of filteredCards(); track card.id) {
          <div class="card" (click)="openWindow(card)">
            <span class="card-category">{{ card.category }}</span>
            <div class="card-content">
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="card-description">{{ card.description }}</p>
            </div>
          </div>
        } @empty {
          <p class="no-results">No components found</p>
        }
      </div>
    </div>
  `,
})
export class HomeComponent {
  searchQuery = signal('');
  cards = signal(CARDS);

  filteredCards = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.cards();
    return this.cards().filter(
      (card) =>
        card.title.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query) ||
        card.category.toLowerCase().includes(query)
    );
  });

  private windowService = inject(WinBoxWindowService);

  openWindow(card: Card): void {
    const win = this.windowService.createWindow({
      title: card.title,
      width: 900,
      height: 700,
      html: `<div class="card-content">
        <p style="color: #666; margin-bottom: 16px;">${card.description}</p>
        ${card.content || ''}
      </div>`,
    });

    // Apply Prism.js syntax highlighting and add copy buttons after window is created
    setTimeout(() => {
      if (win.instance && win.instance.body) {
        const prism = (window as any).Prism;
        const codeBlocks = win.instance.body.querySelectorAll('pre code');
        
        // Add language data attribute and copy button to each code block
        codeBlocks.forEach((block: Element) => {
          const pre = block.parentElement;
          if (!pre || pre.tagName !== 'PRE') return;
          
          // Detect language from class
          const classes = block.className.split(' ');
          const languageClass = classes.find(c => c.startsWith('language-'));
          const language = languageClass ? languageClass.replace('language-', '') : 'code';
          
          // Add data-language attribute for CSS pseudo-element
          pre.setAttribute('data-language', language);
          
          // Make pre clickable for copy
          pre.style.cursor = 'pointer';
          pre.title = 'Click to copy code';
          
          // Add click handler for copy functionality
          pre.addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyToClipboard(block.textContent || '', pre);
          });
        });

        // Highlight all code blocks with Prism
        if (prism) {
          prism.highlightAllUnder(win.instance.body);
        } else {
          console.warn('Prism.js not loaded, syntax highlighting unavailable');
        }
      }
    }, 300);
  }

  /**
   * Copy text to clipboard and show visual feedback
   */
  private copyToClipboard(text: string, preElement: HTMLElement): void {
    navigator.clipboard.writeText(text).then(() => {
      // Show copied feedback
      preElement.classList.add('copied');
      
      // Remove feedback after 2 seconds
      setTimeout(() => {
        preElement.classList.remove('copied');
      }, 2000);
    }).catch((err) => {
      console.error('Failed to copy code:', err);
    });
  }
}
