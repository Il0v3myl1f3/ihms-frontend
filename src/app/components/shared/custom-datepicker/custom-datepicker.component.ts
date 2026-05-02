import { Component, input, signal, computed, HostListener, ChangeDetectionStrategy, forwardRef, ElementRef, inject, OnInit, NgZone, DestroyRef, ViewChild, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LucideAngularModule, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-angular';

interface DayItem {
    num: number;
    isCurrentMonth: boolean;
    dateString: string; // YYYY-MM-DD
}

@Component({
    selector: 'app-custom-datepicker',
    imports: [LucideAngularModule],
    templateUrl: './custom-datepicker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomDatepickerComponent),
            multi: true
        }
    ]
})
export class CustomDatepickerComponent implements ControlValueAccessor, OnInit {
    readonly CalendarDays = CalendarDays;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;

    placeholder = input<string>('dd/mm/yyyy');

    isOpen = signal<boolean>(false);
    viewMode = signal<'days' | 'months-years'>('days');
    selectedValue = signal<string>(''); // ISO date
    isDisabled = signal<boolean>(false);

    displayDate = signal<Date>(new Date());

    readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    years = computed(() => {
        const currentYear = new Date().getFullYear();
        const startYear = 1920;
        const endYear = currentYear + 30;
        const yearsArr = [];
        for (let y = endYear; y >= startYear; y--) {
            yearsArr.push(y);
        }
        return yearsArr;
    });

    @ViewChild('monthsCol') monthsCol?: ElementRef;
    @ViewChild('yearsCol') yearsCol?: ElementRef;

    todayIso = this.formatIso(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    constructor() {
        effect(() => {
            if (this.viewMode() === 'months-years') {
                // Wait for DOM to be ready
                setTimeout(() => {
                    this.scrollToSelected();
                }, 0);
            }
        });
    }

    private scrollToSelected(): void {
        if (this.monthsCol) {
            const activeMonth = this.monthsCol.nativeElement.querySelector('.bg-blue-50');
            if (activeMonth) {
                activeMonth.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }
        if (this.yearsCol) {
            const activeYear = this.yearsCol.nativeElement.querySelector('.bg-blue-50');
            if (activeYear) {
                activeYear.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }
    }

    private el = inject(ElementRef);
    private ngZone = inject(NgZone);
    private destroyRef = inject(DestroyRef);
    private onChange: (value: string) => void = () => { };
    private onTouched: () => void = () => { };

    days = computed<DayItem[]>(() => {
        const date = this.displayDate();
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Adjust for Monday-first calendar
        const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const calendarDays: DayItem[] = [];

        // Prev month days
        for (let i = firstDayIndex; i > 0; i--) {
            const d = daysInPrevMonth - i + 1;
            const fullDate = this.formatIso(year, month - 1, d);
            calendarDays.push({ num: d, isCurrentMonth: false, dateString: fullDate });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const fullDate = this.formatIso(year, month, i);
            calendarDays.push({ num: i, isCurrentMonth: true, dateString: fullDate });
        }

        // Next month padding
        const totalDaysNeeded = firstDayIndex + daysInMonth > 35 ? 42 : 35;
        const remaining = totalDaysNeeded - calendarDays.length;
        for (let i = 1; i <= remaining; i++) {
            const fullDate = this.formatIso(year, month + 1, i);
            calendarDays.push({ num: i, isCurrentMonth: false, dateString: fullDate });
        }

        return calendarDays;
    });

    currentMonthName = computed(() => {
        return this.displayDate().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    });

    selectedLabel = computed(() => {
        const val = this.selectedValue();
        if (!val) return '';
        const parts = val.split('-');
        if (parts.length === 3) {
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        return val;
    });

    private formatIso(y: number, m: number, d: number): string {
        const dateObj = new Date(y, m, d);
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    }

    prevMonth(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
        const cur = this.displayDate();
        this.displayDate.set(new Date(cur.getFullYear(), cur.getMonth() - 1, 1));
    }

    nextMonth(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
        const cur = this.displayDate();
        this.displayDate.set(new Date(cur.getFullYear(), cur.getMonth() + 1, 1));
    }

    toggleViewMode(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
        this.viewMode.update(v => v === 'days' ? 'months-years' : 'days');
    }

    selectMonth(monthIndex: number, e: Event): void {
        e.preventDefault();
        e.stopPropagation();
        const cur = this.displayDate();
        this.displayDate.set(new Date(cur.getFullYear(), monthIndex, 1));
        // If we select a month, we might want to stay in selection mode to select a year, 
        // but usually, if the user sees both, they might select one then the other.
        // Let's keep it in the same view until they click 'days' or we can auto-switch if both are selected?
        // Actually, let's just update the display date.
    }

    selectYear(year: number, e: Event): void {
        e.preventDefault();
        e.stopPropagation();
        const cur = this.displayDate();
        this.displayDate.set(new Date(year, cur.getMonth(), 1));
    }

    confirmSelection(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
        this.viewMode.set('days');
    }

    selectDate(day: DayItem, e: Event): void {
        if (this.isDisabled()) return;
        this.selectedValue.set(day.dateString);
        this.onChange(day.dateString);
        this.onTouched();
    }

    ngOnInit(): void {
        this.ngZone.runOutsideAngular(() => {
            // Click outside
            fromEvent(document, 'click', { passive: true })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => {
                    if (this.isOpen() && !this.el.nativeElement.contains(event.target)) {
                        this.ngZone.run(() => {
                            this.isOpen.set(false);
                            this.viewMode.set('days');
                        });
                    }
                });

            // Resize
            fromEvent(window, 'resize', { passive: true })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                    if (this.isOpen()) {
                        this.ngZone.run(() => this.isOpen.set(false));
                    }
                });
        });
    }

    dropdownPos = { top: 0, left: 0, width: 0 };

    toggle(event: Event): void {
        if (this.isDisabled()) return;

        if (!this.isOpen()) {
            const val = this.selectedValue();
            if (val) {
                const p = val.split('-');
                if (p.length === 3) this.displayDate.set(new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2])));
            } else {
                this.displayDate.set(new Date());
            }

            const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
            const dropdownHeight = 320;
            const windowHeight = window.innerHeight;

            let top = btn.bottom + 4;
            if (top + dropdownHeight > windowHeight) {
                top = btn.top - dropdownHeight + 34;
            }

            this.dropdownPos = {
                top: top,
                left: btn.left,
                width: Math.max(btn.width, 280)
            };
        }

        const nextState = !this.isOpen();
        this.isOpen.set(nextState);
        if (!nextState) {
            this.viewMode.set('days');
        }
    }



    // ControlValueAccessor implementation
    writeValue(value: string): void {
        this.selectedValue.set(value || '');
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }
}
