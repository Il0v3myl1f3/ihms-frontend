import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Activity, Heart, Database, Pill, Thermometer, Stethoscope, Facebook, Twitter, Linkedin, ChevronLeft, ChevronRight } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { MedicalService, Doctor } from '../../../services/medical.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PageHeaderComponent],
  templateUrl: './services.component.html'
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
  private gapPx = 24; // gap-6 = 1.5rem = 24px

  // For infinite scroll, duplicate the array enough times to prevent hitting walls
  private loopCount = 10;
  private scrollTimeout: any;
  private initialized = false;

  @ViewChild('carouselContainer') carouselContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private medicalService: MedicalService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.medicalService.getDoctors().subscribe(data => {
      this.totalOriginal = data.length;

      // Create a massive track to simulate infinite native scrolling
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

  @HostListener('window:resize')
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

    // When the user completely stops scrolling, silently reset them to the center
    // of the massive track so they never reach the actual end
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

    // Disable smooth scroll during drag so it precisely tracks the mouse
    el.style.scrollBehavior = 'auto';
    this.startX = e.pageX;
    this.startScrollLeft = el.scrollLeft;

    this.boundDragMove = (ev: MouseEvent) => {
      if (!this.isDragging) return;
      ev.preventDefault();
      const scrollVelocity = 1.5; // Feel slightly lighter
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
    // Re-enable smooth scroll for snapping and button clicks
    this.carouselContainer.nativeElement.style.scrollBehavior = 'smooth';
  }

  private recenterScroll(): void {
    if (!this.carouselContainer) return;
    const el = this.carouselContainer.nativeElement;
    const stepSize = this.cardWidthPx + this.gapPx;

    // Which exact card index are we currently snapped to?
    const currentIndex = Math.round(el.scrollLeft / stepSize);

    // If we've scrolled into the first 2 loops or last 2 loops, jump back to center
    if (currentIndex < 2 * this.totalOriginal || currentIndex >= (this.loopCount - 2) * this.totalOriginal) {
      // Find the relative position within the original 6-item array
      const remainder = currentIndex % this.totalOriginal;

      // Target the middle-most loop (e.g., the 5th loop)
      const middleLoopStart = Math.floor(this.loopCount / 2) * this.totalOriginal;
      const targetIndex = middleLoopStart + remainder;

      // Preserve any micro fractional offset if they happened to drift
      const exactOffset = el.scrollLeft - (currentIndex * stepSize);

      // Silently teleport without animation
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

    // Start exactly in the middle loop
    const middleLoopStart = Math.floor(this.loopCount / 2) * this.totalOriginal;
    el.scrollTo({ left: middleLoopStart * stepSize, behavior: 'auto' });
  }
}
