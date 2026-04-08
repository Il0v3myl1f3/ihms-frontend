import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaboratoryService, Laboratory } from '../../../../services/laboratory.service';
import { LucideAngularModule, FlaskConical, MapPin, Users, Activity, Search } from 'lucide-angular';

@Component({
  selector: 'app-laboratory-page',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './laboratory-page.component.html',
  styleUrls: ['./laboratory-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaboratoryPageComponent implements OnInit {
  readonly FlaskConical = FlaskConical;
  readonly MapPin = MapPin;
  readonly Users = Users;
  readonly Activity = Activity;
  readonly Search = Search;

  private labService = inject(LaboratoryService);
  
  labs = signal<Laboratory[]>([]);
  searchQuery = signal('');
  statusFilter = signal<string>('All');

  filteredLabs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.statusFilter();
    
    return this.labs().filter(lab => {
      const matchesSearch = lab.name.toLowerCase().includes(query) || 
                           lab.location.toLowerCase().includes(query);
      const matchesStatus = filter === 'All' || lab.status === filter;
      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.labService.getLabs().subscribe(data => {
      this.labs.set(data);
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Available': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Occupied': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Maintenance': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  }

  getStatusDotClass(status: string): string {
    switch (status) {
      case 'Available': return 'bg-emerald-500';
      case 'Occupied': return 'bg-amber-500';
      case 'Maintenance': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }
}
