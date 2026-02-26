import { Component, inject, computed, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceContextService } from '../../core/services/workspace-context.service';
import { LanguageService } from '../../core/services/language.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  private workspaceContext = inject(WorkspaceContextService);
  languageService = inject(LanguageService);
  pageTitle = signal<string>('SIDEBAR.DASHBOARD');
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currency = computed(() => this.workspaceContext.currency);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        let currentRoute = this.route.firstChild;
        while (currentRoute?.firstChild) {
          currentRoute = currentRoute.firstChild;
        }

        const title = currentRoute?.snapshot.data['title'];
        if (title) {
          this.pageTitle.set(title);
        }
      });
  }

  toggleLanguage() {
    const newLang = this.languageService.currentLanguage === 'es' ? 'en' : 'es';
    this.languageService.setLanguage(newLang);
  }
}