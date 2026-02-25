import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { ServicesComponent } from './components/pages/services/services.component';
import { DoctorsComponent } from './components/pages/doctors/doctors.component';
import { AboutComponent } from './components/pages/about/about.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' }
];
