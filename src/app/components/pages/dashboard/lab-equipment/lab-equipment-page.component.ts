import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, effect, untracked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaboratoryService, LabEquipment } from '../../../../services/laboratory.service';
import { LucideAngularModule, Search, ChevronDown, ChevronUp, Microscope, MoreHorizontal, Plus, Trash2, Edit2, Settings, Eye, ChevronLeft, ChevronRight, Calendar, MapPin, Tag, Activity, Filter } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/modal/modal.component';

@Component({
  selector: 'app-lab-equipment-page',
  imports: [CommonModule, LucideAngularModule, FormsModule, ModalComponent],
  templateUrl: './lab-equipment-page.component.html',
  styleUrls: ['./lab-equipment-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closeDropdown(); closePageSizeMenu()'
  }
})
export class LabEquipmentPageComponent implements OnInit {
  closePageSizeMenu(): void {
    this.isPageSizeMenuOpen = false;
  }
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
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Tag = Tag;
  readonly Activity = Activity;
  readonly Filter = Filter;

  // Dropdown state
  activeItem: LabEquipment | null = null;
  dropdownPos = { top: 0, right: 0 };

  // Details Modal state
  isDetailsModalOpen = signal(false);
  selectedItemForDetails = signal<LabEquipment | null>(null);

  // Edit Modal state
  isEditModalOpen = signal(false);
  selectedItemForEdit = signal<LabEquipment | null>(null);
  availableLabs = signal<any[]>([]);

  // Add Asset state
  isAddModalOpen = signal(false);
  newItem = signal<Partial<LabEquipment>>({});

  // Modal Dropdown signals
  activeEditLabDropdown = signal(false);
  activeEditStatusDropdown = signal(false);
  activeAddLabDropdown = signal(false);
  activeAddStatusDropdown = signal(false);

  viewDetails(item: LabEquipment): void {
    this.selectedItemForDetails.set(item);
    this.isDetailsModalOpen.set(true);
    this.activeItem = null;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen.set(false);
    // Optional: clear item after transition
    setTimeout(() => this.selectedItemForDetails.set(null), 300);
  }

  openEditModal(item: LabEquipment): void {
    this.selectedItemForEdit.set({ ...item });
    this.isEditModalOpen.set(true);
    this.activeItem = null;
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    setTimeout(() => this.selectedItemForEdit.set(null), 300);
  }

  openAddModal(): void {
    const today = new Date().toISOString().split('T')[0];
    const nextSixMonths = new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0];

    const firstLab = this.availableLabs()[0];
    this.newItem.set({
      name: '',
      type: '',
      status: 'Operational',
      labId: firstLab?.id,
      labName: firstLab?.name,
      lastMaintenanceDate: today,
      nextMaintenanceDate: nextSixMonths
    });
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  saveAdd(): void {
    const data = this.newItem();
    if (data.name && data.labId && data.type) {
      const selectedLab = this.availableLabs().find(l => l.id === Number(data.labId));
      const currentItems = this.items();
      const maxId = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.id)) : 0;
      const maxNo = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.no)) : 0;

      const fullNewItem: LabEquipment = {
        id: maxId + 1,
        no: maxNo + 1,
        name: data.name,
        labId: Number(data.labId),
        labName: selectedLab?.name || 'Unknown Lab',
        type: data.type,
        status: (data.status as any) || 'Operational',
        lastMaintenanceDate: data.lastMaintenanceDate || '',
        nextMaintenanceDate: data.nextMaintenanceDate || '',
        selected: false
      };

      this.items.update(prev => [fullNewItem, ...prev]);
      this.closeAddModal();
    }
  }

  saveEdit(): void {
    const updatedItem = this.selectedItemForEdit();
    if (updatedItem) {
      // Find the lab name from availableLabs if it was changed
      const selectedLab = this.availableLabs().find(l => l.id === Number(updatedItem.labId));
      if (selectedLab) {
        updatedItem.labName = selectedLab.name;
        updatedItem.labId = selectedLab.id;
      }

      this.items.update(items => items.map(item =>
        item.id === updatedItem.id ? { ...updatedItem } : item
      ));
      this.closeEditModal();
    }
  }

  toggleModalDropdown(type: string, event: Event): void {
    event.stopPropagation();
    switch (type) {
      case 'editLab': this.activeEditLabDropdown.set(!this.activeEditLabDropdown()); break;
      case 'editStatus': this.activeEditStatusDropdown.set(!this.activeEditStatusDropdown()); break;
      case 'addLab': this.activeAddLabDropdown.set(!this.activeAddLabDropdown()); break;
      case 'addStatus': this.activeAddStatusDropdown.set(!this.activeAddStatusDropdown()); break;
    }
  }

  selectLab(lab: any, isEdit: boolean): void {
    if (isEdit) {
      const current = this.selectedItemForEdit();
      if (current) {
        this.selectedItemForEdit.set({ ...current, labId: lab.id, labName: lab.name });
      }
      this.activeEditLabDropdown.set(false);
    } else {
      this.newItem.update(prev => ({ ...prev, labId: lab.id, labName: lab.name }));
      this.activeAddLabDropdown.set(false);
    }
  }

  selectStatus(status: string, isEdit: boolean): void {
    if (isEdit) {
      const current = this.selectedItemForEdit();
      if (current) {
        this.selectedItemForEdit.set({ ...current, status: status as any });
      }
      this.activeEditStatusDropdown.set(false);
    } else {
      this.newItem.update(prev => ({ ...prev, status: status as any }));
      this.activeAddStatusDropdown.set(false);
    }
  }

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
    this.activeFilterMenu.set(false);
    this.activeEditLabDropdown.set(false);
    this.activeEditStatusDropdown.set(false);
    this.activeAddLabDropdown.set(false);
    this.activeAddStatusDropdown.set(false);
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
  isPageSizeMenuOpen = false;

  // Dropdown state
  activeFilterMenu = signal<boolean>(false);

  toggleFilterMenu(event: Event): void {
    event.stopPropagation();
    this.activeFilterMenu.set(!this.activeFilterMenu());
  }

  setFilter(value: string): void {
    this.statusFilter.set(value);
    this.activeFilterMenu.set(false);
    this.currentPage.set(1);
  }

  togglePageSizeMenu(event: Event): void {
    event.stopPropagation();
    this.isPageSizeMenuOpen = !this.isPageSizeMenuOpen;
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.isPageSizeMenuOpen = false;
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

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

    this.labService.getLabs().subscribe(labs => {
      this.availableLabs.set(labs);
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


