import { Component, inject, computed, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { BusinessContextService } from '../../core/services/business-context.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
})
export class Navbar {
  private auth = inject(AuthService);
  private businessContext = inject(BusinessContextService);

  currency = computed(() => this.businessContext.currency);

  language = computed(() => {
    const locale = this.businessContext.locale;
    if (locale === 'es-AR') return 'Español (AR)';
    if (locale === 'en-US') return 'English (US)';
    return locale;
  });

  theme = signal('Light');

  logout() {
    this.auth.logout();
  }
}