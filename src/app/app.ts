import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { WorkspaceService } from './features/workspace/services/workspace.service';
import { WorkspaceContextService } from './core/services/workspace-context.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private auth = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  private workspaceContext = inject(WorkspaceContextService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.document.documentElement.classList.add('route-transitioning');
    });

    this.router.events.pipe(
      filter(event => 
        event instanceof NavigationEnd || 
        event instanceof NavigationCancel || 
        event instanceof NavigationError
      )
    ).subscribe(() => {
      setTimeout(() => {
        this.document.documentElement.classList.remove('route-transitioning');
      }, 100);
    });

    if (this.auth.isAuthenticated()) {
      // Fetch User Profile
      this.auth.fetchProfile().subscribe({
        next: (user) => {
          this.auth.setUser(user);
        },
        error: () => {}
      });

      // Fetch Workspaces for Context
      this.workspaceService.getAll().subscribe({
        next: (workspaces) => {
          this.workspaceContext.initialize(workspaces);
        },
        error: () => {}
      });
    }
  }
}