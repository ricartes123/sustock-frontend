import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../business/services/business.service';
import { BusinessContextService } from '../../../../core/services/business-context.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private businessService = inject(BusinessService);
  private businessContext = inject(BusinessContextService);

  email = '';
  password = '';
  error: string | null = null;
  loading = false;

  onSubmit() {
    this.loading = true;
    this.error = null;

    this.auth.login({ email: this.email, password: this.password })
      .subscribe({
        next: (res) => {

          this.auth.setToken(res.accessToken);

          this.businessService.getAll().subscribe({
            next: (businesses) => {
              this.businessContext.initialize(businesses);
              this.router.navigate(['/']);
            }
          });
        },
        error: () => {
          this.error = 'Invalid credentials';
          this.loading = false;
        }
      });
  }
}