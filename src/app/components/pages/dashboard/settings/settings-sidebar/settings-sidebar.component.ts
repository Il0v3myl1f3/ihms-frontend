import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-settings-sidebar',
  imports: [],
  templateUrl: './settings-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSidebarComponent {
  activeTab = input('Account');
  tabChange = output<string>();

  tabs = [
    'Account',
    'Language'
  ];

  setTab(tab: string) {
    this.tabChange.emit(tab);
  }
}
