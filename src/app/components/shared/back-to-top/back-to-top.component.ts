import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowUp } from 'lucide-angular';

@Component({
  selector: 'app-back-to-top',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './back-to-top.component.html',
  styleUrl: './back-to-top.component.css',
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
