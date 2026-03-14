import { Component, ChangeDetectionStrategy } from '@angular/core';
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

    onTabChange(tab: string) {
        this.activeTab = tab;
    }
}
