import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './about.component.html'
})
export class AboutComponent {
}
