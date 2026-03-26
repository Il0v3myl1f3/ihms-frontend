import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './page-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  title = input('');
  subtitle = input<string | undefined>(undefined);
  backgroundImage = input('assets/images/page-header-bg.jpg');
}
