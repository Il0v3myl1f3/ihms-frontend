import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, NgZone, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule, Activity, Heart, Database, Pill, Thermometer, Stethoscope, Facebook, Twitter, Linkedin, ChevronLeft, ChevronRight } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { MedicalService, Doctor } from '../../../services/medical.service';

@Component({
  selector: 'app-services',
  imports: [LucideAngularModule, PageHeaderComponent],
  templateUrl: './services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize()'
  }
})
export class ServicesComponent implements OnInit, OnDestroy, AfterViewInit {
  // Icons
  readonly Activity = Activity;
  readonly Heart = Heart;
  readonly Database = Database;
  readonly Pill = Pill;
  readonly Thermometer = Thermometer;
  readonly Stethoscope = Stethoscope;
  readonly Facebook = Facebook;
  readonly Twitter = Twitter;
  readonly Linkedin = Linkedin;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  servicesList = [
    { id: 'checkup', name: 'Free Checkup', icon: Activity },
    { id: 'cardiogram', name: 'Cardiogram', icon: Heart },
    { id: 'dna', name: 'DNA Testing', icon: Database },
    { id: 'blood', name: 'Blood Bank', icon: Pill },
    { id: 'dermatology', name: 'Dermatology', icon: Thermometer },
    { id: 'orthopedic', name: 'Orthopedic', icon: Stethoscope },
  ];

  activeServiceId = 'checkup';

  // Carousel State
  carouselDoctors: Doctor[] = [];
  visibleCards = 4;
  totalOriginal = 0;
  cardWidthPx = 0;
  private gapPx = 24;

  private loopCount = 10;
  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;

  @ViewChild('carouselContainer') carouselContainer!: ElementRef<HTMLDivElement>;

  private medicalService = inject(MedicalService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.medicalService.getDoctors().subscribe(data => {
      this.totalOriginal = data.length;

      let multiplied: Doctor[] = [];
      for (let i = 0; i < this.loopCount; i++) {
        multiplied = multiplied.concat(data);
      }
      this.carouselDoctors = multiplied;
    });
  }

  setActiveService(id: string): void {
    this.activeServiceId = id;
  }

  get currentService() {
    return this.servicesList.find(s => s.id === this.activeServiceId) || this.servicesList[0];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateDimensions();
      this.centerScrollPosition();
      this.initialized = true;
      this.cdr.detectChanges();
    }, 0);
  }

  onResize(): void {
    if (this.initialized) {
      this.updateDimensions();
      this.centerScrollPosition();
    }
  }

  ngOnDestroy(): void {
    this.cleanupDragListeners();
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
  }

  next(): void {
    if (!this.carouselContainer) return;
    const el = this.carouselContainer.nativeElement;
    const stepSize = this.cardWidthPx + this.gapPx;
    el.scrollBy({ left: stepSize, behavior: 'smooth' });
  }

  prev(): void {
    if (!this.carouselContainer) return;
    const el = this.carouselContainer.nativeElement;
    const stepSize = this.cardWidthPx + this.gapPx;
    el.scrollBy({ left: -stepSize, behavior: 'smooth' });
  }

  onScroll(): void {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

    this.scrollTimeout = setTimeout(() => {
      this.ngZone.run(() => this.recenterScroll());
    }, 150);
  }

  // --- Desktop Mouse Drag Support ---

  isDragging = false;
  private startX = 0;
  private startScrollLeft = 0;
  private boundDragMove: ((e: MouseEvent) => void) | null = null;
  private boundDragEnd: (() => void) | null = null;

  onMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    if (!this.carouselContainer) return;
    const el = this.carouselContainer.nativeElement;

    el.style.scrollBehavior = 'auto';
    this.startX = e.pageX;
    this.startScrollLeft = el.scrollLeft;

    this.boundDragMove = (ev: MouseEvent) => {
      if (!this.isDragging) return;
      ev.preventDefault();
      const scrollVelocity = 1.5;
      const walk = (ev.pageX - this.startX) * scrollVelocity;
      el.scrollLeft = this.startScrollLeft - walk;
    };

    this.boundDragEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.restoreSmoothScroll();
      this.cleanupDragListeners();
    };

    document.addEventListener('mousemove', this.boundDragMove);
    document.addEventListener('mouseup', this.boundDragEnd);
  }

  private cleanupDragListeners(): void {
    if (this.boundDragMove) {
      document.removeEventListener('mousemove', this.boundDragMove);
      this.boundDragMove = null;
    }
    if (this.boundDragEnd) {
      document.removeEventListener('mouseup', this.boundDragEnd);
      this.boundDragEnd = null;
    }
  }

  private restoreSmoothScroll(): void {
    if (!this.carouselContainer) return;
    this.carouselContainer.nativeElement.style.scrollBehavior = 'smooth';
  }

  private recenterScroll(): void {
    if (!this.carouselContainer) return;
    const el = this.carouselContainer.nativeElement;
    const stepSize = this.cardWidthPx + this.gapPx;

    const currentIndex = Math.round(el.scrollLeft / stepSize);

    if (currentIndex < 2 * this.totalOriginal || currentIndex >= (this.loopCount - 2) * this.totalOriginal) {
      const remainder = currentIndex % this.totalOriginal;
      const middleLoopStart = Math.floor(this.loopCount / 2) * this.totalOriginal;
      const targetIndex = middleLoopStart + remainder;
      const exactOffset = el.scrollLeft - (currentIndex * stepSize);
      el.scrollTo({ left: (targetIndex * stepSize) + exactOffset, behavior: 'auto' });
    }
  }

  private updateDimensions(): void {
    if (this.carouselContainer) {
      const containerWidth = this.carouselContainer.nativeElement.offsetWidth;
      this.cardWidthPx = (containerWidth - (this.visibleCards - 1) * this.gapPx) / this.visibleCards;
    }
  }

  private centerScrollPosition(): void {
    if (!this.carouselContainer) return;
    const el = this.carouselContainer.nativeElement;
    const stepSize = this.cardWidthPx + this.gapPx;

    const middleLoopStart = Math.floor(this.loopCount / 2) * this.totalOriginal;
    el.scrollTo({ left: middleLoopStart * stepSize, behavior: 'auto' });
  }
}
