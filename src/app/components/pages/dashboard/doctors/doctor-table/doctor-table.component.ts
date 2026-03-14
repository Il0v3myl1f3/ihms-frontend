import { Component, OnInit, input, output, ChangeDetectionStrategy, signal, computed, HostListener, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-angular';
import { Doctor } from '../../../../../services/medical.service';

@Component({
    selector: 'app-doctor-table',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './doctor-table.component.html',
    styleUrls: ['./doctor-table.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeDropdown()'
    }
})
export class DoctorTableComponent implements OnInit {
    doctors = input<Doctor[]>([]);
    editDoctor = output<Doctor>();
    deleteDoctor = output<Doctor>();

    readonly Search = Search;
    readonly Filter = Filter;
    readonly MoreHorizontal = MoreHorizontal;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly Pencil = Pencil;
    readonly Trash2 = Trash2;

    activeItem: Doctor | null = null;
    dropdownPos = { top: 0, right: 0 };
    currentPage = signal(1);
    pageSize = signal(7);
    searchQuery = signal('');

    constructor() {
        // Reset to page 1 when search query changes
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
    }

    filteredDoctors = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        if (!query) return this.doctors();

        return this.doctors().filter(doc =>
            doc.name.toLowerCase().includes(query) ||
            doc.specialty.toLowerCase().includes(query) ||
            doc.phone?.toLowerCase().includes(query) ||
            doc.availability?.toLowerCase().includes(query)
        );
    });

    @HostListener('window:resize')
    onResize() {
        this.updatePageSize();
    }

    private updatePageSize(): void {
        const width = window.innerWidth;
        const oldPageSize = this.pageSize();
        
        if (width > 1920) {
            this.pageSize.set(10);
        } else if (width > 1024) {
            this.pageSize.set(7);
        } else {
            this.pageSize.set(5);
        }

        // Reset to page 1 if current page is now out of bounds
        if (this.pageSize() !== oldPageSize) {
            if (this.currentPage() > this.totalPages()) {
                this.currentPage.set(1);
            }
        }
    }

    ngOnInit(): void {
        this.updatePageSize();
    }

    totalPages = computed(() => {
        return Math.max(1, Math.ceil(this.filteredDoctors().length / this.pageSize()));
    });

    paginatedDoctors = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.pageSize();
        return this.filteredDoctors().slice(startIndex, startIndex + this.pageSize());
    });

    visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        if (total <= 5) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        if (current <= 3) {
            return [1, 2, 3, '...', total];
        } else if (current >= total - 2) {
            return [1, '...', total - 2, total - 1, total];
        } else {
            return [1, '...', current, '...', total];
        }
    });

    goToPage(page: number | string): void {
        if (typeof page === 'number' && page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
            this.currentPage.set(page);
        }
    }

    nextPage(): void {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update(p => p + 1);
        }
    }

    prevPage(): void {
        if (this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
        }
    }

    closeDropdown(): void {
        this.activeItem = null;
    }

    toggleDropdown(doc: Doctor, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === doc.id) {
            this.activeItem = null;
            return;
        }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = doc;
    }

    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.activeItem = null;
    }

    getAvatarInitialsName(name: string): string {
        return name.replace('Dr. ', '').replace(' ', '+');
    }

    onEdit(doctor: Doctor): void {
        this.editDoctor.emit(doctor);
    }

    onDelete(doctor: Doctor): void {
        this.deleteDoctor.emit(doctor);
    }
}
