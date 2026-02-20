import { Component, inject, computed } from '@angular/core';
import { BusinessContextService } from '../../core/services/business-context.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
})
export class Navbar {
  private businessContext = inject(BusinessContextService);

  currency = computed(() => this.businessContext.currency);

  language = computed(() => {
    const locale = this.businessContext.locale;
    if (locale === 'es-AR') return 'Español (AR)';
    if (locale === 'en-US') return 'English (US)';
    return locale;
  });
}