import { Component, HostBinding, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private auth = inject(AuthService);
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
}
