import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { BusinessService } from './features/business/services/business.service';
import { BusinessContextService } from './core/services/business-context.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private auth = inject(AuthService);
  private businessService = inject(BusinessService);
  private businessContext = inject(BusinessContextService);

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      // Fetch User Profile
      this.auth.fetchProfile().subscribe({
        next: (user) => {
          this.auth.setUser(user);
        }
      });

      // Fetch Businesses for Context
      this.businessService.getAll().subscribe({
        next: (businesses) => {
          this.businessContext.initialize(businesses);
        }
      });
    }
  }
}