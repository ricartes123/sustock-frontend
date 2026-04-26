import { Component, HostBinding, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslateModule, LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {

  isCollapsed = false;

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
