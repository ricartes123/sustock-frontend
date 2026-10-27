import { inject } from '@angular/core';
import { catchError, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { WorkspaceContextService } from '../services/workspace-context.service';
import { WorkspaceService } from '../../features/workspace/services/workspace.service';

// Runs before the first navigation so guarded routes never fire requests without x-workspace-id.
export function initializeSession() {
  const auth = inject(AuthService);
  const workspaceService = inject(WorkspaceService);
  const workspaceContext = inject(WorkspaceContextService);

  return auth.restoreSession().pipe(
    switchMap((user) =>
      user
        ? workspaceService.getAll().pipe(
            tap((workspaces) => workspaceContext.initialize(workspaces)),
            catchError(() => of(null))
          )
        : of(null)
    )
  );
}
