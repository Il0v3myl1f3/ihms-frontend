import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsSidebarComponent } from './settings-sidebar/settings-sidebar.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';

@Component({
    selector: 'app-dashboard-settings',
    imports: [CommonModule, SettingsSidebarComponent, AccountSettingsComponent],
    templateUrl: './dashboard-settings.component.html',
    styleUrl: './dashboard-settings.component.css'
})
export class DashboardSettingsComponent {
    activeTab: string = 'Account';

    onTabChange(tab: string) {
        this.activeTab = tab;
    }
}
