import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { BackToTopComponent } from './components/shared/back-to-top/back-to-top.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, BackToTopComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('ihms-frontend');
  isDashboard = signal(false);
  isAuthPage = signal(false);

  private readonly AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects;
        this.isDashboard.set(url.startsWith('/dashboard'));
        this.isAuthPage.set(this.AUTH_ROUTES.some(r => url === r || url.startsWith(r + '?')));
      });
  }
}
