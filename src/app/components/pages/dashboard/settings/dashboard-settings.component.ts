import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsSidebarComponent } from './settings-sidebar/settings-sidebar.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';

@Component({
    selector: 'app-dashboard-settings',
    imports: [SettingsSidebarComponent, AccountSettingsComponent],
    templateUrl: './dashboard-settings.component.html',
    styleUrl: './dashboard-settings.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardSettingsComponent {
    activeTab: string = 'Account';
    
    private router = inject(Router);

    onTabChange(tab: string) {
        this.activeTab = tab;
    }

    saveSettings() {
        alert('Settings saved successfully!');
    }

    cancelSettings() {
        alert('Changes discarded!');
    }
}
