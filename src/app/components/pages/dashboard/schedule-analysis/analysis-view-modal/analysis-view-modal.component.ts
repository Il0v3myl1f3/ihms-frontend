import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, User, Calendar, Clock, Microscope, MapPin, Info, ClipboardCheck } from 'lucide-angular';
import { MedicalAnalysis } from '../../../../services/laboratory.service';

@Component({
  selector: 'app-analysis-view-modal',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './analysis-view-modal.component.html',
  styleUrls: ['./analysis-view-modal.component.css']
})
export class AnalysisViewModalComponent {
  analysis = input<MedicalAnalysis | null>(null);
  isOpen = input<boolean>(false);
  closeModal = output<void>();

  // Icons
  readonly X = X;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly Clock = Clock;
  readonly Microscope = Microscope;
  readonly MapPin = MapPin;
  readonly Info = Info;
  readonly ClipboardCheck = ClipboardCheck;

  onClose() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Scheduled': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'InProgress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Cancelled': return 'bg-gray-50 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  }
}
