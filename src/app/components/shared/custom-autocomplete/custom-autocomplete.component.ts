import { Component, input, output, signal, computed, HostListener, ChangeDetectionStrategy, forwardRef, ElementRef, inject, OnDestroy, OnInit, NgZone, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, X, ChevronDown } from 'lucide-angular';
import { CommonModule } from '@angular/common';

export interface AutocompleteOption {
    value: string;
    label: string;
    disabled?: boolean;
}

@Component({
    selector: 'app-custom-autocomplete',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './custom-autocomplete.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomAutocompleteComponent),
            multi: true
        }
    ]
})
export class CustomAutocompleteComponent implements ControlValueAccessor, OnInit, OnDestroy {
    readonly Search = Search;
    readonly X = X;
    readonly ChevronDown = ChevronDown;

    options = input<AutocompleteOption[]>([]);
    placeholder = input<string>('Search...');

    isOpen = signal(false);
    selectedValue = signal<string>('');
    searchText = signal<string>('');
    isDisabled = input<boolean>(false, { alias: 'disabled' });
    internalDisabled = signal(false);
    effectiveDisabled = computed(() => this.isDisabled() || this.internalDisabled());

    private el = inject(ElementRef);
    private ngZone = inject(NgZone);
    private destroyRef = inject(DestroyRef);
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    filteredOptions = computed(() => {
        const text = this.searchText().toLowerCase();
        if (!text) return this.options();
        return this.options().filter(o => o.label.toLowerCase().includes(text));
    });

    selectedLabel = computed(() => {
        const val = this.selectedValue();
        const opt = this.options().find(o => o.value === val);
        return opt ? opt.label : '';
    });

    dropdownPos = { top: 0, left: 0, width: 0 };

    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchText.set(value);
        this.isOpen.set(true);
        this.updateDropdownPosition();
        
        // If the user clears the input, we might want to clear the selection too
        if (!value) {
            this.selectOption({ value: '', label: '' }, true);
        }
    }

    toggle(event: Event): void {
        if (this.isDisabled()) return;
        
        if (!this.isOpen()) {
            this.updateDropdownPosition();
            // Pre-fill search text with current label if selected
            this.searchText.set(this.selectedLabel());
        }
        
        this.isOpen.update(v => !v);
    }

    public updateDropdownPosition(): void {
        const btn = this.el.nativeElement.getBoundingClientRect();
        this.dropdownPos = {
            top: btn.bottom + 4,
            left: btn.left,
            width: btn.width
        };
    }

    selectOption(option: AutocompleteOption, isManual = false): void {
        if (option.disabled) return;
        this.selectedValue.set(option.value);
        this.searchText.set(option.label);
        this.onChange(option.value);
        this.onTouched();
        this.isOpen.set(false);
    }

    clear(event: Event): void {
        event.stopPropagation();
        this.selectOption({ value: '', label: '' }, true);
        this.searchText.set('');
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
                            // Reset search text to selected label when closing
                            this.searchText.set(this.selectedLabel());
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

            // Scroll
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
        // Sync search text with the label of the initial value
        const opt = this.options().find(o => o.value === (value || ''));
        this.searchText.set(opt ? opt.label : '');
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.internalDisabled.set(isDisabled);
    }
}
