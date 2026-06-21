import { Component, inject, computed, signal, HostListener, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { CommonModule } from '@angular/common';
import { Modal } from '../../shared/components/modal/modal';
import { Button } from '../../shared/components/button/button';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, Modal, Button, LucideAngularModule, TranslateModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  private auth = inject(AuthService);
  themeService = inject(ThemeService);
  user = this.auth.user;
  private eRef = inject(ElementRef);

  showLogoutModal = signal(false);
  showDropdown = signal(false);

  greeting = computed(() => {
    const hour = new Date().getHours();
    const name = this.user()?.firstName || '';
    const timeGreeting =
      hour >= 5 && hour < 12
        ? 'Buenos días'
        : hour >= 12 && hour < 20
          ? 'Buenas tardes'
          : 'Buenas noches';

    return name ? `${timeGreeting}, ${name} 👋` : timeGreeting;
  });

  constructor() { }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown.set(false);
    }
  }

  toggleDropdown() {
    this.showDropdown.update(v => !v);
  }

  triggerLogout() {
    this.showLogoutModal.set(true);
  }

  cancelLogout() {
    this.showLogoutModal.set(false);
  }

  confirmLogout() {
    this.showLogoutModal.set(false);
    this.auth.logout();
  }
}
