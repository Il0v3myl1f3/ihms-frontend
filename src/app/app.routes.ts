import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';
import { authGuard } from './guards/auth.guard';

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
    path: 'login',
    loadComponent: () => import('./components/pages/login/login-page.component').then(m => m.LoginPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/pages/register/register-page.component').then(m => m.RegisterPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/pages/forgot-password/forgot-password-page.component').then(m => m.ForgotPasswordPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/pages/reset-password/reset-password-page.component').then(m => m.ResetPasswordPageComponent),
    canActivate: [authGuard]
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
        path: 'doctors',
        loadComponent: () => import('./components/pages/dashboard/doctors/dashboard-doctors.component').then(m => m.DashboardDoctorsComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['admin'] }
      },
      {
        path: 'doctors/:id',
        loadComponent: () => import('./components/pages/dashboard/doctors/doctor-details-page/doctor-details-page.component').then(m => m.DoctorDetailsPageComponent),
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
        path: 'user',
        loadComponent: () => import('./components/pages/dashboard/home/dashboard-home.component').then(m => m.DashboardHomeComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['admin'] }
      },
      {
        path: 'laboratory',
        loadComponent: () => import('./components/pages/dashboard/laboratory/laboratory-page.component').then(m => m.LaboratoryPageComponent)
      },
      {
        path: 'schedule-analysis',
        loadComponent: () => import('./components/pages/dashboard/schedule-analysis/schedule-analysis-page.component').then(m => m.ScheduleAnalysisPageComponent)
      },
      {
        path: 'analysis-results',
        loadComponent: () => import('./components/pages/dashboard/analysis-results/analysis-results-page.component').then(m => m.AnalysisResultsPageComponent)
      },
      {
        path: 'lab-equipment',
        loadComponent: () => import('./components/pages/dashboard/lab-equipment/lab-equipment-page.component').then(m => m.LabEquipmentPageComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['admin'] }
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/pages/dashboard/settings/dashboard-settings.component').then(m => m.DashboardSettingsComponent)
      },
      {
        path: 'help-center',
        loadComponent: () => import('./components/pages/dashboard/help-center/help-center.component').then(m => m.HelpCenterComponent),
        canActivate: [roleGuard],
        data: { allowedRoles: ['user'] }
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
