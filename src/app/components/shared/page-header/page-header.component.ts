import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  imports: [],
  templateUrl: './page-header.component.html'
})
export class PageHeaderComponent {
  title = input('');
  subtitle = input<string | undefined>(undefined);
}
