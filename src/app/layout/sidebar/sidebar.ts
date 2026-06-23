import { Component, HostBinding } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  imports: [RouterLink, RouterLinkActive, CommonModule, LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {

  isCollapsed = false;

  menuItems: NavItem[] = [
    { icon: 'layout-dashboard', label: 'Panel', route: '/', exact: true },
    { icon: 'box', label: 'Productos', route: '/products' },
    { icon: 'shopping-cart', label: 'Ventas', route: '/sales' },
    { icon: 'arrow-right-left', label: 'Movimientos', route: '/movements' },
    { icon: 'users', label: 'Clientes', route: '/clients' },
  ];

  settingsItems: NavItem[] = [
    { icon: 'settings', label: 'Configuración', route: '/settings' },
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
