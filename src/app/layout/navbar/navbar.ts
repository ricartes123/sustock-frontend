import { Component, inject, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceContextService } from '../../core/services/workspace-context.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  private workspaceContext = inject(WorkspaceContextService);
  languageService = inject(LanguageService);

  currency = computed(() => this.workspaceContext.currency);

  toggleLanguage() {
    const newLang = this.languageService.currentLanguage === 'es' ? 'en' : 'es';
    this.languageService.setLanguage(newLang);
  }
}