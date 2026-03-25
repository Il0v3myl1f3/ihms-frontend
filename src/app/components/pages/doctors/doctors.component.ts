import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { NgOptimizedImage } from '@angular/common';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { MedicalService, Doctor } from '../../../services/medical.service';

@Component({
  selector: 'app-doctors',
  imports: [LucideAngularModule, PageHeaderComponent, NgOptimizedImage],
  templateUrl: './doctors.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorsComponent implements OnInit {


  doctors: Doctor[] = [];

  private medicalService = inject(MedicalService);

  ngOnInit(): void {
    this.medicalService.getDoctors().subscribe(data => {
      this.doctors = data;
    });
  }
}
