import { Component, HostBinding } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';

export interface NavItem {
  icon: string;
  label: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslateModule, LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {

  isCollapsed = false;

  menuItems: NavItem[] = [
    { icon: 'layout-dashboard', label: 'SIDEBAR.DASHBOARD', route: '/', exact: true },
    { icon: 'box', label: 'SIDEBAR.PRODUCTS', route: '/products' },
    { icon: 'shopping-cart', label: 'SIDEBAR.SALES', route: '/sales' },
    { icon: 'arrow-right-left', label: 'SIDEBAR.MOVEMENTS', route: '/movements' },
    { icon: 'users', label: 'SIDEBAR.CLIENTS', route: '/clients' },
  ];

  settingsItems: NavItem[] = [
    { icon: 'settings', label: 'SIDEBAR.SETTINGS', route: '/settings' },
  ];

  @HostBinding('class') get hostClasses() {
    return `hidden md:flex flex-col shrink-0 h-full transition-all duration-300 ${this.isCollapsed ? 'w-20' : 'w-64'}`;
  }

  get activeNavClass(): string {
    return 'bg-primary-600 !text-white font-medium';
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
