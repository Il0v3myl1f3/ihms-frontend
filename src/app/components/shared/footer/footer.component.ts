import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Facebook, Instagram, Linkedin, Phone, Mail, MapPin, Send } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  readonly Facebook = Facebook;
  readonly Instagram = Instagram;
  readonly Linkedin = Linkedin;
  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly MapPin = MapPin;
  readonly Send = Send;
}
