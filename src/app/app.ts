import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
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
  }
}