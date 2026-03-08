import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnChanges, OnDestroy {
    @Input() isOpen = false;
    @Input() title = '';
    @Output() close = new EventEmitter<void>();

    readonly X = X;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen']) {
            if (this.isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    ngOnDestroy(): void {
        // Ensure scroll is restored if the component is destroyed while open
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
