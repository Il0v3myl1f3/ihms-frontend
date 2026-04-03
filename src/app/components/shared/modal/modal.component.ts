import { Component, input, output, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'app-modal',
    imports: [LucideAngularModule],
    templateUrl: './modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnChanges, OnDestroy {
    isOpen = input(false);
    title = input('');
    close = output<void>();

    readonly X = X;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen']) {
            if (this.isOpen()) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    ngOnDestroy(): void {
        document.body.style.overflow = '';
    }

    onClose(): void {
        this.close.emit();
    }

    onBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).tagName.toLowerCase() === 'div' && (event.target as HTMLElement).classList.contains('modal-backdrop')) {
            this.close.emit();
        }
    }
}
