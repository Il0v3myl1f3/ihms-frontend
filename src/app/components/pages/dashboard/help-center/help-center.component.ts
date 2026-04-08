import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    LucideAngularModule,
    Search,
    BookOpen,
    MessageCircle,
    Phone,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    FileText,
    ExternalLink,
    Calendar,
    Pill,
    FlaskConical,
    CreditCard
} from 'lucide-angular';

interface FAQ {
    question: string;
    answer: string;
    category: string;
    isOpen: boolean;
}

@Component({
    selector: 'app-help-center',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './help-center.component.html',
    styles: [`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `]
})
export class HelpCenterComponent {
    // Icons
    Search = Search;
    BookOpen = BookOpen;
    MessageCircle = MessageCircle;
    Phone = Phone;
    HelpCircle = HelpCircle;
    ChevronDown = ChevronDown;
    ChevronUp = ChevronUp;
    FileText = FileText;
    ExternalLink = ExternalLink;
    Calendar = Calendar;
    Pill = Pill;
    FlaskConical = FlaskConical;
    CreditCard = CreditCard;

    searchQuery = signal('');

    categories = [
        { name: 'Appointments', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Prescriptions', icon: Pill, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { name: 'Laboratory', icon: FlaskConical, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: 'Payments', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' }
    ];

    faqs = signal<FAQ[]>([
        {
            category: 'Appointments',
            question: 'How do I schedule a new appointment?',
            answer: 'You can schedule an appointment by navigating to the "Appointments" tab in your dashboard and clicking the "New Appointment" button. You will be able to select your preferred doctor and available time slot.',
            isOpen: true
        },
        {
            category: 'Appointments',
            question: 'Can I cancel or reschedule my appointment online?',
            answer: 'Yes, appointments can be rescheduled or cancelled up to 24 hours before the scheduled time. Go to your appointments list and select "Edit" or "Cancel" on the specific appointment.',
            isOpen: false
        },
        {
            category: 'Prescriptions',
            question: 'How can I request a prescription refill?',
            answer: 'Navigate to the "Prescriptions" section. For any active prescription, you can see if refills are available. If you need a new refill not listed, please book a quick consultation with your doctor.',
            isOpen: false
        },
        {
            category: 'Laboratory',
            question: 'How long does it take to get laboratory results?',
            answer: 'Most routine lab results are available within 24-48 hours. Specialized tests may take up to 5-7 business days. You will receive a notification as soon as they are uploaded to your profile.',
            isOpen: false
        },
        {
            category: 'Payments',
            question: 'What payment methods are accepted?',
            answer: 'We accept all major credit cards, debit cards, and secure online payments. You can also pay via insurance if your provider is partnered with us.',
            isOpen: false
        }
    ]);

    toggleFaq(index: number) {
        this.faqs.update(list => {
            const newList = [...list];
            newList[index].isOpen = !newList[index].isOpen;
            return newList;
        });
    }

    onSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.searchQuery.set(value);
    }

    get filteredFaqs() {
        const query = this.searchQuery().toLowerCase();
        if (!query) return this.faqs();
        return this.faqs().filter(f =>
            f.question.toLowerCase().includes(query) ||
            f.answer.toLowerCase().includes(query) ||
            f.category.toLowerCase().includes(query)
        );
    }
}

