import { Component, input, signal, computed, HostListener, ChangeDetectionStrategy, forwardRef, ElementRef, inject, OnDestroy } from '@angular/core';
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
export class CustomTimepickerComponent implements ControlValueAccessor, OnDestroy {
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
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    dropdownPos = { top: 0, left: 0, width: 0 };

    private scrollListener = (event: Event) => {
        if (this.isOpen()) {
            const target = event.target as Node;
            if (this.el.nativeElement.contains(target)) return;
            this.isOpen.set(false);
        }
    };

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', this.scrollListener, true);
        }
    }

    ngOnDestroy() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('scroll', this.scrollListener, true);
        }
    }

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

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        if (!this.el.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
        }
    }

    @HostListener('window:resize')
    onResize(): void {
        this.isOpen.set(false);
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
