import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, FlaskConical, MapPin, User, Phone, Clock, Activity, Users, ClipboardList, Info } from 'lucide-angular';
import { Laboratory, LaboratoryService, LabEquipment, MedicalAnalysis } from '../../../../../services/laboratory.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-laboratory-view-modal',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './laboratory-view-modal.component.html',
  styleUrls: ['./laboratory-view-modal.component.css']
})
export class LaboratoryViewModalComponent {
  lab = input<Laboratory | null>(null);
  isOpen = input<boolean>(false);
  closeModal = output<void>();

  private labService: LaboratoryService = inject(LaboratoryService);

  readonly X = X;
  readonly FlaskConical = FlaskConical;
  readonly MapPin = MapPin;
  readonly User = User;
  readonly Phone = Phone;
  readonly Clock = Clock;
  readonly Activity = Activity;
  readonly Users = Users;
  readonly ClipboardList = ClipboardList;
  readonly Info = Info;

  allEquipment = toSignal(this.labService.getEquipment(), { initialValue: [] as LabEquipment[] });
  allAnalyses = toSignal(this.labService.getAnalyses(), { initialValue: [] as MedicalAnalysis[] });

  equipment = computed(() => {
    const currentLab = this.lab();
    if (!currentLab) return [] as LabEquipment[];
    return this.allEquipment().filter(e => e.labId === currentLab.id);
  });

  analyses = computed(() => {
    const currentLab = this.lab();
    if (!currentLab) return [] as MedicalAnalysis[];
    return this.allAnalyses().filter(a => a.labId === currentLab.id);
  });

  onClose() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Available': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Occupied': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Maintenance': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  }

  getEquipmentStatusClass(status: string): string {
    switch (status) {
      case 'Operational': return 'text-emerald-600 bg-emerald-50';
      case 'Under Maintenance': return 'text-amber-600 bg-amber-50';
      case 'Out of Service': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  }
}
