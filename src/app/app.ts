import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { WorkspaceService } from './features/workspace/services/workspace.service';
import { WorkspaceContextService } from './core/services/workspace-context.service';
import { LanguageService } from './core/services/language.service';

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
  private languageService = inject(LanguageService);

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      // Fetch User Profile
      this.auth.fetchProfile().subscribe({
        next: (user) => {
          this.auth.setUser(user);
        }
      });

      // Fetch Workspaces for Context
      this.workspaceService.getAll().subscribe({
        next: (workspaces) => {
          this.workspaceContext.initialize(workspaces);
        }
      });
    }
  }
}