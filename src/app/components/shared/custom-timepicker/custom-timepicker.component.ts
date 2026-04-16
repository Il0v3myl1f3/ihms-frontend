import { Component, input, signal, computed, HostListener, ChangeDetectionStrategy, forwardRef, ElementRef, inject, OnDestroy, OnInit, NgZone, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LucideAngularModule, Clock, ChevronDown } from 'lucide-angular';

@Component({
    selector: 'app-custom-timepicker',
    imports: [LucideAngularModule],
    templateUrl: './custom-timepicker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomTimepickerComponent),
            multi: true
        }
    ]
})
export class CustomTimepickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    readonly Clock = Clock;
    readonly ChevronDown = ChevronDown;

    placeholder = input<string>('00:00');

    isOpen = signal<boolean>(false);
    selectedValue = signal<string>(''); // HH:mm
    isDisabled = signal<boolean>(false);

    // Formatted hours and minutes
    hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    selectedHour = computed(() => this.selectedValue().split(':')[0] || '00');
    selectedMinute = computed(() => this.selectedValue().split(':')[1] || '00');

    private el = inject(ElementRef);
    private ngZone = inject(NgZone);
    private destroyRef = inject(DestroyRef);
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    dropdownPos = { top: 0, left: 0, width: 0 };

    ngOnInit(): void {
        this.ngZone.runOutsideAngular(() => {
            // Click outside
            fromEvent(document, 'click', { passive: true })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => {
                    if (this.isOpen() && !this.el.nativeElement.contains(event.target)) {
                        this.ngZone.run(() => this.isOpen.set(false));
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

            // Scroll (Capturing phase)
            fromEvent(window, 'scroll', { passive: true, capture: true })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => {
                    if (this.isOpen()) {
                        const target = event.target as Node;
                        if (!this.el.nativeElement.contains(target)) {
                            this.ngZone.run(() => this.isOpen.set(false));
                        }
                    }
                });
        });
    }

    ngOnDestroy() { }

    toggle(event: Event): void {
        if (this.isDisabled()) return;
        
        if (!this.isOpen()) {
            const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
            this.dropdownPos = {
                top: btn.bottom + 4,
                left: btn.left,
                width: 200 // Fixed width for the 2-column dropdown
            };

            // Ensure the value has a default if empty
            if (!this.selectedValue()) {
                this.selectedValue.set('09:00');
            }
        }
        
        this.isOpen.update(v => !v);
    }

    selectHour(h: string, event: Event): void {
        event.stopPropagation();
        const m = this.selectedMinute();
        const newValue = `${h}:${m}`;
        this.updateValue(newValue);
    }

    selectMinute(m: string, event: Event): void {
        event.stopPropagation();
        const h = this.selectedHour();
        const newValue = `${h}:${m}`;
        this.updateValue(newValue);
    }

    private updateValue(val: string): void {
        this.selectedValue.set(val);
        this.onChange(val);
        this.onTouched();
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
