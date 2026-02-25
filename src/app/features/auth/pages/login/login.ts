import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, TranslateModule],
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private workspaceService = inject(WorkspaceService);
  private workspaceContext = inject(WorkspaceContextService);

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

    const request$ = this.isLoginMode
      ? this.auth.login({ email: this.email, password: this.password })
      : this.auth.register({
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        workspaceName: this.workspaceName,
        currency: this.currency,
      });

    request$.subscribe({
      next: (res: any) => {
        // Handle successful operation (either login response with token, or register response without token)
        const processLogin = (token: string) => {
          this.auth.setToken(token);
          this.auth.fetchProfile().subscribe({
            next: (user) => {
              this.auth.setUser(user);
              this.workspaceService.getAll().subscribe({
                next: (workspaces) => {
                  this.workspaceContext.initialize(workspaces);
                  this.router.navigate(['/']);
                }
              });
            }
          });
        };

        if (this.isLoginMode) {
          processLogin(res.accessToken);
        } else {
          // If we just registered successfully, automatically login to get the token
          this.auth.login({ email: this.email, password: this.password }).subscribe({
            next: (loginRes) => processLogin(loginRes.accessToken),
            error: () => {
              this.error = 'Registered successfully, but failed to auto-login. Please login manually.';
              this.loading = false;
              this.toggleMode();
            }
          });
        }
      },
      error: (err) => {
        // Display precise validation errors from the backend class-validator pipeline
        const errObj = err.error?.message;
        const exactError = Array.isArray(errObj) ? errObj[0] : errObj;

        this.error = exactError || (this.isLoginMode ? 'Invalid credentials' : 'Failed to register');
        this.loading = false;
      }
    });
  }
}