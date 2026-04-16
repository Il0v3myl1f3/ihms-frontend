import { Component, input, output, signal, computed, HostListener, ChangeDetectionStrategy, forwardRef, ElementRef, inject, OnDestroy, OnInit, NgZone, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomSelectComponent),
            multi: true
        }
    ]
})
export class CustomSelectComponent implements ControlValueAccessor, OnInit, OnDestroy {
    readonly ChevronDown = ChevronDown;

    options = input<SelectOption[]>([]);
    placeholder = input<string>('Select');

    isOpen = signal(false);
    selectedValue = signal<string>('');
    isDisabled = signal(false);

    private el = inject(ElementRef);
    private ngZone = inject(NgZone);
    private destroyRef = inject(DestroyRef);
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    selectedLabel = computed(() => {
        const val = this.selectedValue();
        const opt = this.options().find(o => o.value === val);
        return opt ? opt.label : '';
    });

    dropdownPos = { top: 0, left: 0, width: 0 };

    toggle(event: Event): void {
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
        if (option.disabled) return;
        this.selectedValue.set(option.value);
        this.onChange(option.value);
        this.onTouched();
        this.isOpen.set(false);
    }

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

            // Scroll (Capturing phase to catch scroll events on any container)
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
