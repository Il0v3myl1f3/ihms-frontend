import { Component, input, output, signal, computed, HostListener, ChangeDetectionStrategy, forwardRef, ElementRef, inject, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

@Component({
    selector: 'app-custom-select',
    imports: [LucideAngularModule],
    templateUrl: './custom-select.component.html',
    styleUrl: './custom-select.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomSelectComponent),
            multi: true
        }
    ]
})
export class CustomSelectComponent implements ControlValueAccessor, OnDestroy {
    readonly ChevronDown = ChevronDown;

    options = input<SelectOption[]>([]);
    placeholder = input<string>('Select');

    isOpen = signal(false);
    selectedValue = signal<string>('');
    isDisabled = signal(false);

    private el = inject(ElementRef);
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    selectedLabel = computed(() => {
        const val = this.selectedValue();
        const opt = this.options().find(o => o.value === val);
        return opt ? opt.label : '';
    });

    dropdownPos = { top: 0, left: 0, width: 0 };

    toggle(event: Event): void {
        event.stopPropagation();
        if (this.isDisabled()) return;
        
        if (!this.isOpen()) {
            const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
            this.dropdownPos = {
                top: btn.bottom + 4,
                left: btn.left,
                width: btn.width
            };
        }
        
        this.isOpen.update(v => !v);
    }

    selectOption(option: SelectOption, event: Event): void {
        event.stopPropagation();
        if (option.disabled) return;
        this.selectedValue.set(option.value);
        this.onChange(option.value);
        this.onTouched();
        this.isOpen.set(false);
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

    private scrollListener = () => {
        if (this.isOpen()) {
            this.isOpen.set(false);
        }
    };

    constructor() {
        // Use capturing phase to catch scroll events on any scrollable container (like the modal body)
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', this.scrollListener, true);
        }
    }

    ngOnDestroy() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('scroll', this.scrollListener, true);
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
