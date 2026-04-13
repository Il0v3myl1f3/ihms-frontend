import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaboratoryService, MedicalAnalysis } from '../../../../services/laboratory.service';
import { LucideAngularModule, Search, ChevronDown, ChevronUp, CalendarPlus, Clock, User, Microscope, Eye } from 'lucide-angular';
import { AnalysisViewModalComponent } from './analysis-view-modal/analysis-view-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule-analysis-page',
  imports: [CommonModule, LucideAngularModule, FormsModule, AnalysisViewModalComponent],
  templateUrl: './schedule-analysis-page.component.html',
  styleUrls: ['./schedule-analysis-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleAnalysisPageComponent implements OnInit {
  // Icons
  readonly Search = Search;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly CalendarPlus = CalendarPlus;
  readonly Eye = Eye;

  readonly readOnly = signal(true);

  private labService = inject(LaboratoryService);
  
  // Data State
  items = signal<MedicalAnalysis[]>([]);
  
  // Table State
  searchQuery = signal('');
  statusFilter = signal<string>('All');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  isViewModalOpen = signal(false);
  selectedAnalysis = signal<MedicalAnalysis | null>(null);
  
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Scheduled': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'InProgress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Cancelled': return 'bg-gray-50 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  }
}
