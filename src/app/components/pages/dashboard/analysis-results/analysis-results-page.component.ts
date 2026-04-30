import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, effect, untracked, DestroyRef, NgZone } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AnalysisResultService, AnalysisResult } from '../../../../services/analysis-result.service';
import {
  LucideAngularModule,
  Search, ChevronDown, ChevronUp, Clock, User, Microscope, MoreHorizontal,
  Download, Filter, ChevronLeft, ChevronRight, Eye, FileText,
  CheckCircle2, AlertCircle, AlertTriangle, Activity, Stethoscope,
  Calendar, ClipboardCheck, FlaskConical, Building2
} from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/modal/modal.component';

@Component({
  selector: 'app-analysis-results-page',
  imports: [CommonModule, LucideAngularModule, FormsModule, ModalComponent],
  templateUrl: './analysis-results-page.component.html',
  styleUrls: ['./analysis-results-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closeDropdown(); closePageSizeMenu()'
  }
})
export class AnalysisResultsPageComponent implements OnInit {
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
  readonly Download = Download;
  readonly Filter = Filter;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Eye = Eye;
  readonly FileText = FileText;
  readonly CheckCircle2 = CheckCircle2;
  readonly AlertCircle = AlertCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly Activity = Activity;
  readonly Stethoscope = Stethoscope;
  readonly Calendar = Calendar;
  readonly ClipboardCheck = ClipboardCheck;
  readonly FlaskConical = FlaskConical;
  readonly Building2 = Building2;

  private analysisResultService = inject(AnalysisResultService);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);

  // Data State
  items = signal<AnalysisResult[]>([]);
  activeItem: AnalysisResult | null = null;
  dropdownPos = { top: 0, right: 0 };

  // Table State
  searchQuery = signal('');
  interpretationFilter = signal<string>('All');
  currentPage = signal(1);
  pageSize = signal(7);
  sortColumn = signal<keyof AnalysisResult | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  isPageSizeMenuOpen = false;

  // Dropdown state
  activeFilterMenu = signal<boolean>(false);

  toggleFilterMenu(event: Event): void {
    event.stopPropagation();
    this.activeFilterMenu.set(!this.activeFilterMenu());
  }

  setFilter(value: string): void {
    this.interpretationFilter.set(value);
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

  // Computed Table Data
  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const interp = this.interpretationFilter();
    let result = this.items();

    if (query) {
      result = result.filter(item =>
        (item.patientName || '').toLowerCase().includes(query) ||
        (item.analysisType || '').toLowerCase().includes(query) ||
        (item.doctorName || '').toLowerCase().includes(query) ||
        (item.labName || '').toLowerCase().includes(query)
      );
    }

    if (interp !== 'All') {
      result = result.filter(item => item.interpretation === interp);
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
      this.interpretationFilter();
      untracked(() => this.currentPage.set(1));
    });
  }

  ngOnInit(): void {
    this.analysisResultService.getResults()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: AnalysisResult[]) => {
        this.items.set(data);
      });

    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'scroll', { passive: true })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.activeItem) {
            this.ngZone.run(() => {
              this.activeItem = null;
            });
          }
        });
    });
  }

  toggleSort(column: keyof AnalysisResult) {
    if (this.sortColumn() === column) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  toggleDropdown(item: AnalysisResult, event: Event): void {
    event.stopPropagation();
    if (this.activeItem?.id === item.id) {
      this.activeItem = null;
      return;
    }
    const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
    this.activeItem = item;
  }

  // Report Modal
  isReportModalOpen = signal(false);
  selectedResult = signal<AnalysisResult | null>(null);

  openReport(item: AnalysisResult): void {
    this.selectedResult.set(item);
    this.isReportModalOpen.set(true);
  }

  closeReport(): void {
    this.isReportModalOpen.set(false);
    this.selectedResult.set(null);
  }

  closeDropdown(): void {
    this.activeItem = null;
    this.activeFilterMenu.set(false);
  }

  /** Format an ISO date string to dd.MM.yyyy */
  formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  /** Build the display string for the result value + unit */
  formatResultValue(item: AnalysisResult): string {
    if (!item.resultValue) return '—';
    return item.unit ? `${item.resultValue} ${item.unit}` : item.resultValue;
  }

  getInterpretationClass(interpretation: string | null): string {
    switch (interpretation) {
      case 'Normal':   return 'badge-normal';
      case 'Abnormal': return 'badge-abnormal';
      case 'Critical': return 'badge-critical';
      default:         return 'badge-default';
    }
  }
}
