import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-settings-sidebar',
  imports: [],
  templateUrl: './settings-sidebar.component.html',
  styleUrl: './settings-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSidebarComponent {
  activeTab = input('Account');
  tabChange = output<string>();

  tabs = [
    'General',
    'Plan & Pricing',
    'Account',
    'Payment & Billings',
    'Link Account',
    'Language',
    'Preferences',
    'Push Notifications'
  ];

  setTab(tab: string) {
    this.tabChange.emit(tab);
  }
}
