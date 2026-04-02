import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'services',
    loadComponent: () => import('./components/pages/services/services.component').then(m => m.ServicesComponent)
  },
  {
    path: 'doctors',
    loadComponent: () => import('./components/pages/doctors/doctors.component').then(m => m.DoctorsComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./components/pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/pages/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/pages/dashboard/home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./components/pages/dashboard/appointments/appointments-page.component').then(m => m.AppointmentsPageComponent)
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./components/pages/dashboard/prescriptions/prescriptions-page.component').then(m => m.PrescriptionsPageComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['user'] }
      },
      {
        path: 'medical-records',
        loadComponent: () => import('./components/pages/dashboard/medical-records/medical-records-page.component').then(m => m.MedicalRecordsPageComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['user'] }
      },
      {
        path: 'room',
        loadComponent: () => import('./components/pages/dashboard/rooms/room-list-page.component').then(m => m.RoomListPageComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['admin'] }
      },
      {
        path: 'payment',
        loadComponent: () => import('./components/pages/dashboard/payments/payment-list-page.component').then(m => m.PaymentListPageComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['admin', 'user'] }
      },
      {
        path: 'doctors',
        loadComponent: () => import('./components/pages/dashboard/doctors/dashboard-doctors.component').then(m => m.DashboardDoctorsComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['admin'] }
      },
      {
        path: 'patient',
        loadComponent: () => import('./components/pages/dashboard/patient/patient-list-page.component').then(m => m.PatientListPageComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['admin', 'doctor'] }
      },
      {
        path: 'patient/:id',
        loadComponent: () => import('./components/pages/dashboard/patient/patient-details-page/patient-details-page.component').then(m => m.PatientDetailsPageComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['admin', 'doctor'] }
      },
      {
        path: 'inpatient',
        loadComponent: () => import('./components/pages/dashboard/inpatient/inpatient-list-page.component').then(m => m.InpatientListPageComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['admin', 'doctor'] }
      },
      {
        path: 'user',
        loadComponent: () => import('./components/pages/dashboard/home/dashboard-home.component').then(m => m.DashboardHomeComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['admin'] }
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/pages/dashboard/settings/dashboard-settings.component').then(m => m.DashboardSettingsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
