import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { ServicesComponent } from './components/pages/services/services.component';
import { DoctorsComponent } from './components/pages/doctors/doctors.component';
import { AboutComponent } from './components/pages/about/about.component';
import { ContactComponent } from './components/pages/contact/contact.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { DashboardHomeComponent } from './components/pages/dashboard/home/dashboard-home.component';
import { DashboardDoctorsComponent } from './components/pages/dashboard/doctors/dashboard-doctors.component';
import { DashboardSettingsComponent } from './components/pages/dashboard/settings/dashboard-settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'appointment', component: DashboardHomeComponent },
      { path: 'room', component: DashboardHomeComponent },
      { path: 'payment', component: DashboardHomeComponent },
      { path: 'doctors', component: DashboardDoctorsComponent },
      { path: 'patient', component: DashboardHomeComponent },
      { path: 'inpatient', component: DashboardHomeComponent },
      { path: 'user', component: DashboardHomeComponent },
      { path: 'settings', component: DashboardSettingsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
