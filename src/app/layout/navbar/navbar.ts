import { Component, inject, computed } from '@angular/core';
import { WorkspaceContextService } from '../../core/services/workspace-context.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
})
export class Navbar {
  private workspaceContext = inject(WorkspaceContextService);

  currency = computed(() => this.workspaceContext.currency);

  language = computed(() => {
    const locale = this.workspaceContext.locale;
    if (locale === 'es-AR') return 'Español (AR)';
    if (locale === 'en-US') return 'English (US)';
    return locale;
  });
}