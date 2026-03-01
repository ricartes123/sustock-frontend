import { Component, HostBinding, inject, importProvidersFrom } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import {
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    TranslateModule,
    LucideAngularModule
  ],
  templateUrl: './sidebar.html',
})

export class Sidebar {
  private auth = inject(AuthService);
  languageService = inject(LanguageService);
  user = this.auth.user;

  isCollapsed = false;
  isTrackingOpen = false;

  @HostBinding('class') get hostClasses() {
    return `block shrink-0 h-full transition-all duration-300 ${this.isCollapsed ? 'w-20' : 'w-64'}`;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleTracking() {
    this.isTrackingOpen = !this.isTrackingOpen;
  }

  logout() {
    this.auth.logout();
  }

  toggleLanguage() {
    const newLang = this.languageService.currentLanguage === 'es' ? 'en' : 'es';
    this.languageService.setLanguage(newLang);
  }
}
