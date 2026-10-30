import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { WorkspaceContextService } from './workspace-context.service';
import { AuthService, User } from './auth.service';

const ws = (id: string) => ({ id, name: id, currency: 'ARS' });

describe('WorkspaceContextService', () => {
  const user = signal<User | null>(null);
  let service: WorkspaceContextService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: { user } }] });
    service = TestBed.inject(WorkspaceContextService);
  });

  it('restores the saved workspace when it still exists', () => {
    localStorage.setItem('activeWorkspaceId', 'b');
    service.initialize([ws('a'), ws('b')]);
    expect(service.activeWorkspace()?.id).toBe('b');
  });

  it('falls back to the first workspace when the saved id is stale', () => {
    localStorage.setItem('activeWorkspaceId', 'gone');
    service.initialize([ws('a')]);
    expect(service.activeWorkspace()?.id).toBe('a');
    expect(localStorage.getItem('activeWorkspaceId')).toBe('a');
  });

  it('clears the saved id when the user has no workspaces', () => {
    localStorage.setItem('activeWorkspaceId', 'gone');
    service.initialize([]);
    expect(service.activeWorkspace()).toBeNull();
    expect(localStorage.getItem('activeWorkspaceId')).toBeNull();
  });

  it('treats owners and ADMIN members as admins, but not STAFF', () => {
    service.initialize([ws('a')]);
    const base = { id: 'u', email: 'e', firstName: 'f', lastName: 'l' };

    user.set({ ...base, workspaces: [ws('a')], teamMemberships: [] });
    expect(service.isAdmin()).toBe(true);

    user.set({ ...base, workspaces: [], teamMemberships: [{ role: 'ADMIN', workspace: ws('a') }] });
    expect(service.isAdmin()).toBe(true);

    user.set({ ...base, workspaces: [], teamMemberships: [{ role: 'STAFF', workspace: ws('a') }] });
    expect(service.isAdmin()).toBe(false);
  });

  it('treats only the workspace owner as owner', () => {
    service.initialize([ws('a')]);
    const base = { id: 'u', email: 'e', firstName: 'f', lastName: 'l' };

    user.set({ ...base, workspaces: [ws('a')], teamMemberships: [] });
    expect(service.isOwner()).toBe(true);

    user.set({ ...base, workspaces: [], teamMemberships: [{ role: 'ADMIN', workspace: ws('a') }] });
    expect(service.isOwner()).toBe(false);
  });
});
