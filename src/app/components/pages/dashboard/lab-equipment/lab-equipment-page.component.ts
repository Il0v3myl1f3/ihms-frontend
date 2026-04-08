import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, effect, untracked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaboratoryService, LabEquipment } from '../../../../services/laboratory.service';
import { LucideAngularModule, Search, ChevronDown, ChevronUp, Microscope, MoreHorizontal, Plus, Trash2, Edit2, Settings, Eye } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lab-equipment-page',
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './lab-equipment-page.component.html',
  styleUrls: ['./lab-equipment-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closeDropdown()'
  }
})
export class LabEquipmentPageComponent implements OnInit {
  // Icons
  readonly Search = Search;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly Microscope = Microscope;
  readonly MoreHorizontal = MoreHorizontal;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Edit2 = Edit2;
  readonly Settings = Settings;
  readonly Eye = Eye;

  // Dropdown state
  activeItem: LabEquipment | null = null;
  dropdownPos = { top: 0, right: 0 };

  toggleDropdown(item: LabEquipment, event: Event): void {
    event.stopPropagation();
    if (this.activeItem?.id === item.id) {
      this.activeItem = null;
      return;
    }
    const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
    this.activeItem = item;
  }

  closeDropdown(): void {
    this.activeItem = null;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.activeItem = null;
  }

  private labService = inject(LaboratoryService);
  
  // Data State
  items = signal<LabEquipment[]>([]);
  
  // Table State
  searchQuery = signal('');
  statusFilter = signal<string>('All');
  currentPage = signal(1);
  pageSize = signal(7);
  sortColumn = signal<keyof LabEquipment | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // Selection
  selectedCount = computed(() => this.items().filter(i => i.selected).length);
  allSelected = computed(() => this.paginatedItems().length > 0 && this.paginatedItems().every(i => i.selected));

  // Computed Table Data
  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    let result = this.items();

    if (query) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.labName.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
    }

    if (status !== 'All') {
      result = result.filter(item => item.status === status);
    }

    const col = this.sortColumn();
    if (col) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      result = [...result].sort((a, b) => {
        const valA = String(a[col] ?? '');
        const valB = String(b[col] ?? '');
        return valA.localeCompare(valB) * dir;
      });
    }

    return result;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize())));

  paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    
    if (current <= 3) return [1, 2, 3, 4, '...', total];
    if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  });

  constructor() {
    effect(() => {
      this.searchQuery();
      this.statusFilter();
      untracked(() => this.currentPage.set(1));
    });
  }

  ngOnInit(): void {
    this.labService.getEquipment().subscribe(data => {
      this.items.set(data.map(item => ({ ...item, selected: false })));
    });
  }

  toggleSort(column: keyof LabEquipment) {
    if (this.sortColumn() === column) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  toggleSelectAll() {
    const newVal = !this.allSelected();
    const paginatedIds = new Set(this.paginatedItems().map(i => i.id));
    this.items.update(items => items.map(item => 
      paginatedIds.has(item.id) ? { ...item, selected: newVal } : item
    ));
  }

  toggleSelectItem(id: number) {
    this.items.update(items => items.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  }

  deleteSelected() {
    this.items.update(items => items.filter(i => !i.selected));
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Operational': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Under Maintenance': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Out of Service': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  }
}
