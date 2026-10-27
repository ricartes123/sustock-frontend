import { Injectable, signal, inject, computed } from '@angular/core';
import { Workspace } from '../../features/workspace/services/workspace.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WorkspaceContextService {
  private authService = inject(AuthService);

  private _workspaces = signal<Workspace[]>([]);
  private _activeWorkspace = signal<Workspace | null>(null);

  workspaces = this._workspaces.asReadonly();
  activeWorkspace = this._activeWorkspace.asReadonly();

  isAdmin = computed(() => {
    const user = this.authService.user();
    const active = this._activeWorkspace();

    if (!user || !active) return false;

    return user.workspaces.some(b => b.id === active.id) ||
      user.teamMemberships.some(m => m.workspace.id === active.id && m.role !== 'STAFF');
  });

  initialize(workspaces: Workspace[]) {
    this._workspaces.set(workspaces);

    const savedId = localStorage.getItem('activeWorkspaceId');
    const found = workspaces.find(b => b.id === savedId);

    this._activeWorkspace.set(found ?? workspaces[0] ?? null);

    if (this._activeWorkspace()) {
      localStorage.setItem(
        'activeWorkspaceId',
        this._activeWorkspace()!.id
      );
    }
  }

  setActiveWorkspace(workspace: Workspace) {
    this._activeWorkspace.set(workspace);
    localStorage.setItem('activeWorkspaceId', workspace.id);
  }

  get currency() {
    return this._activeWorkspace()?.currency ?? 'USD';
  }

  get currencySymbol(): string {
    switch (this.currency) {
      case 'EUR': return '€';
      case 'BRL': return 'R$';
      default: return '$';
    }
  }

  get locale(): string {
    switch (this.currency) {
      case 'USD': return 'es-AR';
      case 'EUR': return 'de-DE';
      case 'CLP': return 'es-CL';
      case 'BRL': return 'pt-BR';
      case 'MXN': return 'es-MX';
      case 'ARS': return 'es-AR';
      default: return 'es-AR';
    }
  }
}