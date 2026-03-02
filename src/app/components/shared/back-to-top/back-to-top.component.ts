import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowUp } from 'lucide-angular';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './back-to-top.component.html',
  styleUrl: './back-to-top.component.css'
})
export class BackToTopComponent {
  readonly ArrowUp = ArrowUp;
  isVisible = false;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Show button when user scrolls down 300px from top
    this.isVisible = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

