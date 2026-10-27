import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { switchMap, tap } from 'rxjs/operators';
import { HotToastService } from '@ngxpert/hot-toast';
import { Button } from '../../../../shared/components/button/button';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, Button],
  templateUrl: './login.html',
})

export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private workspaceService = inject(WorkspaceService);
  private workspaceContext = inject(WorkspaceContextService);
  private toast = inject(HotToastService);

  email = '';
  password = '';
  firstName = '';
  lastName = '';
  workspaceName = '';
  currency = 'ARS';

  // Signals: the app is zoneless, so plain fields changed in HTTP callbacks would not re-render
  isLoginMode = signal(true);
  error = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);

  toggleMode() {
    this.isLoginMode.update(value => !value);
    this.error.set(null);
  }

  togglePassword() {
    this.showPassword.update(value => !value);
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    const authRequest$ = this.isLoginMode()
      ? this.auth.login({ email: this.email, password: this.password })
      : this.auth.register({
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        workspaceName: this.workspaceName,
        currency: this.currency,
      });

    authRequest$.pipe(
      switchMap(() => this.workspaceService.getAll()),
      tap((workspaces) => this.workspaceContext.initialize(workspaces))
    ).subscribe({
      next: () => {
        this.toast.success('¡Bienvenido/a!');
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.describeError(err));
        this.toast.error(this.error()!);
        this.loading.set(false);
      }
    });
  }

  // A 404/5xx/network failure means the API is unreachable (e.g. another process on its port),
  // which must not be reported as wrong credentials.
  private describeError(err: HttpErrorResponse): string {
    if (err.status === 0 || err.status === 404 || err.status >= 500) {
      return 'No se pudo conectar con el servidor. Intentá de nuevo en unos minutos.';
    }

    if (err.status === 401) {
      return 'Email o contraseña incorrectos.';
    }

    const message = err.error?.message;
    const detail = Array.isArray(message) ? message[0] : message;

    if (detail === 'Email already in use') {
      return 'Ya existe una cuenta con ese email.';
    }

    return detail ? `Revisá los datos ingresados: ${detail}` : 'No se pudo completar la operación.';
  }
}