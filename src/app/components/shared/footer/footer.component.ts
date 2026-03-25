import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule, Facebook, Instagram } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  readonly Facebook = Facebook;
  readonly Instagram = Instagram;
}
