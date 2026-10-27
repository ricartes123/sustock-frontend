import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  isLoginMode = true;
  error: string | null = null;
  loading = false;
  showPassword = signal(false);

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;
  }

  togglePassword() {
    this.showPassword.update(value => !value);
  }

  onSubmit() {
    this.loading = true;
    this.error = null;

    const authRequest$ = this.isLoginMode
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
      error: (err) => {
        if (!this.error) {
          const errObj = err.error?.message;
          const exactError = Array.isArray(errObj) ? errObj[0] : errObj;
          this.error = exactError || (this.isLoginMode ? 'Credenciales inválidas' : 'Error al registrarse');
        }
        this.toast.error(this.error || 'Error');
        this.loading = false;
      }
    });
  }
}