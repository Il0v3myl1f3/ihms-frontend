import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-sidebar.component.html',
  styleUrl: './settings-sidebar.component.css'
})
export class SettingsSidebarComponent {
  @Input() activeTab: string = 'Account';
  @Output() tabChange = new EventEmitter<string>();

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
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }
}
