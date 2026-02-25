import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Calendar, Users, SquareArrowOutUpRight, ChevronRight, Brain, Activity, Microscope, Stethoscope, Eye, Heart, Baby, Thermometer, Database, Pill } from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly SquareArrowOutUpRight = SquareArrowOutUpRight;
  readonly ChevronRight = ChevronRight;

  // Icons for data
  readonly Brain = Brain;
  readonly Activity = Activity;
  readonly Microscope = Microscope;
  readonly Stethoscope = Stethoscope;
  readonly Eye = Eye;
  readonly Heart = Heart;
  readonly Baby = Baby;
  readonly Thermometer = Thermometer;
  readonly Database = Database;
  readonly Pill = Pill;

  servicesData = [
    {
      id: 'cardiogram',
      name: 'Cardiogram',
      icon: Heart,
      title: 'Advanced Heart Monitoring',
      description: 'Our state-of-the-art cardiogram services provide detailed insights into your heart health. We use the latest technology to ensure accurate diagnostics and rapid evaluation of any cardiac concerns.',
      bullets: ['ECG/EKG Testing', 'Stress Tests', 'Holter Monitoring', 'Echocardiography']
    },
    {
      id: 'dna',
      name: 'DNA Testing',
      icon: Database,
      title: 'Discover Your Genetic Blueprint',
      description: 'Unlock the secrets of your health with our comprehensive DNA testing services. Understand your genetic predispositions safely and confidently to optimize your lifestyle and long-term health plan.',
      bullets: ['Genetic Screening', 'Ancestry Analysis', 'Pharmacogenomics', 'Nutrigenomics']
    },
    {
      id: 'blood',
      name: 'Blood Bank',
      icon: Pill,
      title: 'Safe and Reliable Blood Supply',
      description: 'Our certified blood bank ensures a steady and completely safe supply of blood for all medical procedures. We adhere strictly to the highest international safety standards for blood collection and storage.',
      bullets: ['Blood Donation', 'Plasma Separation', 'Platelet Storage', 'Cross-matching']
    },
    {
      id: 'dermatology',
      name: 'Dermatology',
      icon: Thermometer,
      title: 'Expert Skin Care Solutions',
      description: 'From routine skin checks to advanced treatments, our dermatology department offers comprehensive care for all your skin concerns. Let our specialists help you maintain healthy, glowing skin year-round.',
      bullets: ['Skin Cancer Screening', 'Acne Treatment', 'Laser Therapy', 'Cosmetic Dermatology']
    }
  ];

  activeService = this.servicesData[0];

  selectService(service: any) {
    this.activeService = service;
  }

  specialties = [
    { name: 'Neurology', icon: Brain },
    { name: 'Bones', icon: Activity },
    { name: 'Oncology', icon: Microscope },
    { name: 'Otorhinolaryngology', icon: Stethoscope },
    { name: 'Ophthalmology', icon: Eye },
    { name: 'Cardiovascular', icon: Heart },
    { name: 'Pulmonology', icon: Activity },
    { name: 'Renal Medicine', icon: Activity },
    { name: 'Gastroenterology', icon: Activity },
    { name: 'Urology', icon: Activity },
    { name: 'Dermatology', icon: Thermometer },
    { name: 'Gynecology', icon: Baby },
  ];

  passionDots = ['A Passion for Healing', 'All our best', 'Always Caring', 'Believe in Us', 'Always Trusting', 'Everyday Care'];
}
