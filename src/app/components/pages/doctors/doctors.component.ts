import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule, Facebook, Twitter, Linkedin } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { MedicalService, Doctor } from '../../../services/medical.service';

@Component({
  selector: 'app-doctors',
  imports: [LucideAngularModule, PageHeaderComponent],
  templateUrl: './doctors.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorsComponent implements OnInit {
  readonly Facebook = Facebook;
  readonly Twitter = Twitter;
  readonly Linkedin = Linkedin;

  doctors: Doctor[] = [];

  private medicalService = inject(MedicalService);

  ngOnInit(): void {
    this.medicalService.getDoctors().subscribe(data => {
      this.doctors = data;
    });
  }
}
