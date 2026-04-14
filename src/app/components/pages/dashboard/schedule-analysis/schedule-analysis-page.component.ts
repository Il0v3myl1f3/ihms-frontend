import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, effect, untracked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaboratoryService, MedicalAnalysis } from '../../../../services/laboratory.service';
import { LucideAngularModule, Search, ChevronDown, ChevronUp, Clock, User, Microscope, MoreHorizontal, Plus, Trash2, Filter, ChevronLeft, ChevronRight, Eye, Edit2, Download, CheckCircle2, XCircle, CalendarPlus, MapPin, Activity } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { AnalysisViewModalComponent } from './analysis-view-modal/analysis-view-modal.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { CustomDatepickerComponent } from '../../../shared/custom-datepicker/custom-datepicker.component';
import { CustomTimepickerComponent } from '../../../shared/custom-timepicker/custom-timepicker.component';

@Component({
  selector: 'app-schedule-analysis-page',
  imports: [CommonModule, LucideAngularModule, FormsModule, AnalysisViewModalComponent, ModalComponent, CustomDatepickerComponent, CustomTimepickerComponent],
  templateUrl: './schedule-analysis-page.component.html',
  styleUrls: ['./schedule-analysis-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closeDropdown(); closePageSizeMenu()'
  }
})
export class ScheduleAnalysisPageComponent implements OnInit {
  closePageSizeMenu(): void {
    this.isPageSizeMenuOpen = false;
  }
  // Icons
  readonly Search = Search;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly Clock = Clock;
  readonly User = User;
  readonly Microscope = Microscope;
  readonly MoreHorizontal = MoreHorizontal;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Filter = Filter;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Eye = Eye;
  readonly Edit2 = Edit2;
  readonly MapPin = MapPin;
  readonly Activity = Activity;
  readonly Download = Download;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly CalendarPlus = CalendarPlus;

  private labService = inject(LaboratoryService);

  // Data State
  items = signal<MedicalAnalysis[]>([]);
  availableLabs = signal<any[]>([]);
  analysisTypes = [
    'Complete Blood Count (CBC)',
    'Lipid Profile',
    'Urine Culture',
    'Liver Function Test (LFT)',
    'Blood Glucose',
    'Renal Function Test',
    'Thyroid Profile'
  ];
  
  readOnly = signal<boolean>(false);
  activeItem: MedicalAnalysis | null = null;
  dropdownPos = { top: 0, right: 0 };

  // Modal State
  isAddModalOpen = signal(false);
  isEditModalOpen = signal(false);
  isViewModalOpen = signal(false);
  
  newAnalysis = signal<Partial<MedicalAnalysis>>({});
  selectedAnalysis = signal<MedicalAnalysis | null>(null);

  // Modal Dropdown signals
  activeAddTypeDropdown = signal(false);
  activeAddLabDropdown = signal(false);
  activeEditTypeDropdown = signal(false);
  activeEditLabDropdown = signal(false);
  activeEditStatusDropdown = signal(false);

  // Date/Time Split State
  tempDate = signal<string>('');
  tempTime = signal<string>('');

  private updateTempFromDateTime(dateTimeStr: string): void {
    if (!dateTimeStr) {
      this.tempDate.set('');
      this.tempTime.set('09:00');
      return;
    }
    const parts = dateTimeStr.split(' ');
    this.tempDate.set(parts[0] || '');
    this.tempTime.set(parts[1] || '09:00');
  }

  private getCombinedDateTime(): string {
    const d = this.tempDate() || new Date().toISOString().split('T')[0];
    const t = this.tempTime() || '09:00';
    return `${d} ${t}`;
  }

  // Table State
  searchQuery = signal('');
  statusFilter = signal<string>('All');
  currentPage = signal(1);
  pageSize = signal(7);
  sortColumn = signal<keyof MedicalAnalysis | null>(null);
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
        item.patientName.toLowerCase().includes(query) ||
        item.analysisType.toLowerCase().includes(query) ||
        item.labName.toLowerCase().includes(query) ||
        item.doctorName.toLowerCase().includes(query)
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
    this.labService.getAnalyses().subscribe(data => {
      this.items.set(data.map(item => ({ ...item, selected: false })));
    });

    this.labService.getLabs().subscribe(labs => {
      this.availableLabs.set(labs);
    });
  }

  // Table Actions
  toggleSort(column: keyof MedicalAnalysis) {
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

  onView(analysis: MedicalAnalysis) {
    this.selectedAnalysis.set(analysis);
    this.isViewModalOpen.set(true);
  }

  onCloseViewModal() {
    this.isViewModalOpen.set(false);
    this.selectedAnalysis.set(null);
  }

  openAddModal(): void {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const scheduledDate = nextWeek.toISOString().slice(0, 16).replace('T', ' ');

    this.newAnalysis.set({
      patientName: '',
      analysisType: this.analysisTypes[0],
      labId: this.availableLabs()[0]?.id,
      labName: this.availableLabs()[0]?.name,
      scheduledDate: scheduledDate,
      status: 'Scheduled',
      doctorName: ''
    });
    this.updateTempFromDateTime(scheduledDate);
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  saveAdd(): void {
    const data = this.newAnalysis();
    if (data.patientName && data.analysisType && data.labId) {
      const currentItems = this.items();
      const maxId = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.id)) : 0;
      const maxNo = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.no)) : 0;

      const fullItem: MedicalAnalysis = {
        id: maxId + 1,
        no: maxNo + 1,
        patientName: data.patientName,
        analysisType: data.analysisType,
        labId: Number(data.labId),
        labName: data.labName || 'Unknown Lab',
        scheduledDate: this.getCombinedDateTime(),
        status: 'Scheduled',
        doctorName: data.doctorName || '',
        selected: false
      };

      this.items.update(prev => [fullItem, ...prev]);
      this.closeAddModal();
    }
  }

  openEditModal(item: MedicalAnalysis): void {
    this.selectedAnalysis.set({ ...item });
    this.updateTempFromDateTime(item.scheduledDate);
    this.isEditModalOpen.set(true);
    this.activeItem = null;
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    setTimeout(() => this.selectedAnalysis.set(null), 300);
  }

  saveEdit(): void {
    const updated = this.selectedAnalysis();
    if (updated) {
      updated.scheduledDate = this.getCombinedDateTime();
      this.items.update(items => items.map(item =>
        item.id === updated.id ? { ...updated } : item
      ));
      this.closeEditModal();
    }
  }

  deleteSelected(): void {
    this.items.update(items => items.filter(i => !i.selected));
  }

  toggleModalDropdown(type: string, event: Event): void {
    event.stopPropagation();
    switch (type) {
      case 'addType': this.activeAddTypeDropdown.set(!this.activeAddTypeDropdown()); break;
      case 'addLab': this.activeAddLabDropdown.set(!this.activeAddLabDropdown()); break;
      case 'editType': this.activeEditTypeDropdown.set(!this.activeEditTypeDropdown()); break;
      case 'editLab': this.activeEditLabDropdown.set(!this.activeEditLabDropdown()); break;
      case 'editStatus': this.activeEditStatusDropdown.set(!this.activeEditStatusDropdown()); break;
    }
  }

  selectType(type: string, isEdit: boolean): void {
    if (isEdit) {
      const current = this.selectedAnalysis();
      if (current) this.selectedAnalysis.set({ ...current, analysisType: type });
      this.activeEditTypeDropdown.set(false);
    } else {
      this.newAnalysis.update(prev => ({ ...prev, analysisType: type }));
      this.activeAddTypeDropdown.set(false);
    }
  }

  selectLab(lab: any, isEdit: boolean): void {
    if (isEdit) {
      const current = this.selectedAnalysis();
      if (current) this.selectedAnalysis.set({ ...current, labId: lab.id, labName: lab.name });
      this.activeEditLabDropdown.set(false);
    } else {
      this.newAnalysis.update(prev => ({ ...prev, labId: lab.id, labName: lab.name }));
      this.activeAddLabDropdown.set(false);
    }
  }

  selectStatus(status: string): void {
    const current = this.selectedAnalysis();
    if (current) this.selectedAnalysis.set({ ...current, status: status as any });
    this.activeEditStatusDropdown.set(false);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Scheduled': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'InProgress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Cancelled': return 'bg-gray-50 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  }

  closeDropdown(): void {
    this.activeItem = null;
    this.activeFilterMenu.set(false);
    this.activeAddTypeDropdown.set(false);
    this.activeAddLabDropdown.set(false);
    this.activeEditTypeDropdown.set(false);
    this.activeEditLabDropdown.set(false);
    this.activeEditStatusDropdown.set(false);
  }

  toggleDropdown(item: MedicalAnalysis, event: Event): void {
    event.stopPropagation();
    if (this.activeItem?.id === item.id) {
      this.activeItem = null;
      return;
    }
    const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
    this.activeItem = item;
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.closeDropdown();
  }
}
