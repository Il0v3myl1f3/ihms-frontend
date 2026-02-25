import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Phone, MapPin, Mail, Clock } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PageHeaderComponent],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  readonly Phone = Phone;
  readonly MapPin = MapPin;
  readonly Mail = Mail;
  readonly Clock = Clock;

}
