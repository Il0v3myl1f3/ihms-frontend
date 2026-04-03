import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule, ArrowUp } from 'lucide-angular';

@Component({
  selector: 'app-back-to-top',
  imports: [LucideAngularModule],
  templateUrl: './back-to-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onWindowScroll()'
  }
})
export class BackToTopComponent {
  readonly ArrowUp = ArrowUp;
  isVisible = false;

  onWindowScroll(): void {
    this.isVisible = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
