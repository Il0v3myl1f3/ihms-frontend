import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LaboratoryService, Laboratory } from '../../../../services/laboratory.service';
import { LucideAngularModule, Search, FlaskConical, MapPin, Phone, Clock, Eye, Info, Filter, ChevronDown, Activity, Users, Plus, Edit, Trash2 } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { LaboratoryViewModalComponent } from './laboratory-view-modal/laboratory-view-modal.component';
import { LaboratoryCreateModalComponent } from './laboratory-create-modal/laboratory-create-modal.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-laboratory-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, LaboratoryViewModalComponent, LaboratoryCreateModalComponent],
  templateUrl: './laboratory-page.component.html',
  styleUrls: ['./laboratory-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closeDropdown()'
  }
})
export class LaboratoryPageComponent implements OnInit {
  // Icons
  readonly Search = Search;
  readonly FlaskConical = FlaskConical;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Clock = Clock;
  readonly Eye = Eye;
  readonly Info = Info;
  readonly Filter = Filter;
  readonly ChevronDown = ChevronDown;
  readonly Activity = Activity;
  readonly Users = Users;
  readonly Plus = Plus;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;

  private labService = inject(LaboratoryService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  isAdmin = computed(() => this.authService.getCurrentUser()?.role === 'admin');

  // Data
  labs = signal<Laboratory[]>([]);
  searchQuery = signal('');
  statusFilter = signal<string>('All');

  // Dropdown state
  activeFilterMenu = signal<boolean>(false);

  toggleFilterMenu(event: Event): void {
    event.stopPropagation();
    this.activeFilterMenu.set(!this.activeFilterMenu());
  }

  setFilter(value: string): void {
    this.statusFilter.set(value);
    this.activeFilterMenu.set(false);
  }

  closeDropdown(): void {
    this.activeFilterMenu.set(false);
  }

  isDetailsModalOpen = signal(false);
  isCreateModalOpen = signal(false);
  selectedLab = signal<Laboratory | null>(null);
  selectedLabForEdit = signal<Laboratory | null>(null);

  filteredLabs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.statusFilter();

    return this.labs().filter(lab => {
      const matchesSearch = (lab.name?.toLowerCase() ?? '').includes(query) ||
                           (lab.location?.toLowerCase() ?? '').includes(query);
      const matchesStatus = filter === 'All' || lab.status === filter;
      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    // Polling: Refresh from backend every 10 seconds while the page is active
    timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.refreshLabs();
    });
  }

  refreshLabs(): void {
    this.labService.getLabs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.labs.set(data);
      },
      error: (err) => {
        console.error('[LaboratoryPageComponent] Failed to fetch laboratories:', err);
      }
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

  onViewDetails(lab: Laboratory): void {
    this.selectedLab.set(lab);
    this.isDetailsModalOpen.set(true);
  }

  onAddLab(): void {
    this.selectedLabForEdit.set(null);
    this.isCreateModalOpen.set(true);
  }

  onEditLab(lab: Laboratory): void {
    this.selectedLabForEdit.set(lab);
    this.isCreateModalOpen.set(true);
  }

  onDeleteLab(lab: Laboratory): void {
    if (confirm(`Are you sure you want to delete ${lab.name}?`)) {
      this.labService.deleteLaboratory(lab.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.refreshLabs();
      });
    }
  }

  onSaveLab(labData: any): void {
    if (this.selectedLabForEdit()) {
      this.labService.updateLaboratory(this.selectedLabForEdit()!.id, labData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.isCreateModalOpen.set(false);
        this.refreshLabs();
      });
    } else {
      this.labService.createLaboratory(labData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.isCreateModalOpen.set(false);
        this.refreshLabs();
      });
    }
  }

  onCloseModal(): void {
    this.isDetailsModalOpen.set(false);
    this.isCreateModalOpen.set(false);
    this.selectedLab.set(null);
    this.selectedLabForEdit.set(null);
  }
}
