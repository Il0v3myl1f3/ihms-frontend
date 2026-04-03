import { Component, ViewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import { PaymentTableComponent, Payment } from './payment-table/payment-table.component';
import { PaymentCreateModalComponent } from './payment-create-modal/payment-create-modal.component';

@Component({
    selector: 'app-payment-list-page',
    imports: [PaymentTableComponent, PaymentCreateModalComponent],
    templateUrl: './payment-list-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentListPageComponent {
    @ViewChild(PaymentTableComponent) paymentTable!: PaymentTableComponent;

    payments: Payment[] = [
        { id: 1, no: 1, invoiceNumber: 'INV-2024-001', patientName: 'Jane Robertson', amount: 350.00, date: '15/01/2024', method: 'Credit Card', status: 'Paid', selected: false },
        { id: 2, no: 2, invoiceNumber: 'INV-2024-002', patientName: 'Jacob Jones', amount: 1200.00, date: '15/01/2024', method: 'Insurance', status: 'Paid', selected: false },
        { id: 3, no: 3, invoiceNumber: 'INV-2024-003', patientName: 'Eleanor Pena', amount: 450.00, date: '16/01/2024', method: 'Debit Card', status: 'Pending', selected: false },
        { id: 4, no: 4, invoiceNumber: 'INV-2024-004', patientName: 'Leslie Alexander', amount: 800.00, date: '17/01/2024', method: 'Cash', status: 'Paid', selected: false },
        { id: 5, no: 5, invoiceNumber: 'INV-2024-005', patientName: 'Dianne Russell', amount: 275.00, date: '18/01/2024', method: 'Credit Card', status: 'Failed', selected: false },
        { id: 6, no: 6, invoiceNumber: 'INV-2024-006', patientName: 'Devon Lane', amount: 950.00, date: '19/01/2024', method: 'Insurance', status: 'Paid', selected: false },
        { id: 7, no: 7, invoiceNumber: 'INV-2024-007', patientName: 'Kristin Watson', amount: 150.00, date: '20/01/2024', method: 'Bank Transfer', status: 'Pending', selected: false },
        { id: 8, no: 8, invoiceNumber: 'INV-2024-008', patientName: 'Floyd Miles', amount: 2100.00, date: '21/01/2024', method: 'Insurance', status: 'Paid', selected: false },
        { id: 9, no: 9, invoiceNumber: 'INV-2024-009', patientName: 'Courtney Henry', amount: 325.00, date: '22/01/2024', method: 'Credit Card', status: 'Refunded', selected: false },
        { id: 10, no: 10, invoiceNumber: 'INV-2024-010', patientName: 'Albert Flores', amount: 500.00, date: '23/01/2024', method: 'Debit Card', status: 'Paid', selected: false },
        { id: 11, no: 11, invoiceNumber: 'INV-2024-011', patientName: 'Marvin McKinney', amount: 175.00, date: '24/01/2024', method: 'Cash', status: 'Paid', selected: false },
        { id: 12, no: 12, invoiceNumber: 'INV-2024-012', patientName: 'Jerome Bell', amount: 3200.00, date: '25/01/2024', method: 'Insurance', status: 'Pending', selected: false },
        { id: 13, no: 13, invoiceNumber: 'INV-2024-013', patientName: 'Kathryn Murphy', amount: 420.00, date: '26/01/2024', method: 'Credit Card', status: 'Paid', selected: false },
        { id: 14, no: 14, invoiceNumber: 'INV-2024-014', patientName: 'Annette Black', amount: 680.00, date: '27/01/2024', method: 'Bank Transfer', status: 'Failed', selected: false },
        { id: 15, no: 15, invoiceNumber: 'INV-2024-015', patientName: 'Bessie Cooper', amount: 290.00, date: '28/01/2024', method: 'Cash', status: 'Paid', selected: false },
        { id: 16, no: 16, invoiceNumber: 'INV-2024-016', patientName: 'Guy Hawkins', amount: 1500.00, date: '29/01/2024', method: 'Insurance', status: 'Paid', selected: false },
        { id: 17, no: 17, invoiceNumber: 'INV-2024-017', patientName: 'Wade Warren', amount: 375.00, date: '30/01/2024', method: 'Credit Card', status: 'Refunded', selected: false },
        { id: 18, no: 18, invoiceNumber: 'INV-2024-018', patientName: 'Esther Howard', amount: 850.00, date: '31/01/2024', method: 'Debit Card', status: 'Paid', selected: false },
        { id: 19, no: 19, invoiceNumber: 'INV-2024-019', patientName: 'Theresa Webb', amount: 200.00, date: '01/02/2024', method: 'Cash', status: 'Pending', selected: false },
        { id: 20, no: 20, invoiceNumber: 'INV-2024-020', patientName: 'Darrell Steward', amount: 1100.00, date: '02/02/2024', method: 'Insurance', status: 'Paid', selected: false },
        { id: 21, no: 21, invoiceNumber: 'INV-2024-021', patientName: 'Cody Fisher', amount: 560.00, date: '03/02/2024', method: 'Bank Transfer', status: 'Paid', selected: false },
        { id: 22, no: 22, invoiceNumber: 'INV-2024-022', patientName: 'Savannah Nguyen', amount: 430.00, date: '04/02/2024', method: 'Credit Card', status: 'Failed', selected: false },
        { id: 23, no: 23, invoiceNumber: 'INV-2024-023', patientName: 'Brooklyn Simmons', amount: 780.00, date: '05/02/2024', method: 'Insurance', status: 'Paid', selected: false },
        { id: 24, no: 24, invoiceNumber: 'INV-2024-024', patientName: 'Cameron Williamson', amount: 310.00, date: '06/02/2024', method: 'Debit Card', status: 'Pending', selected: false },
        { id: 25, no: 25, invoiceNumber: 'INV-2024-025', patientName: 'Jenny Wilson', amount: 1800.00, date: '07/02/2024', method: 'Insurance', status: 'Refunded', selected: false }
    ];

    selectedPaymentForEdit: Payment | null = null;
    isAddPaymentModalOpen = false;
    isPaymentReadOnly = signal(false);

    openAddPaymentModal() {
        this.selectedPaymentForEdit = null;
        this.isPaymentReadOnly.set(false);
        this.isAddPaymentModalOpen = true;
    }

    closeAddPaymentModal() {
        this.isAddPaymentModalOpen = false;
    }

    onEditPayment(payment: Payment) {
        this.selectedPaymentForEdit = payment;
        this.isPaymentReadOnly.set(false);
        this.isAddPaymentModalOpen = true;
    }

    onViewPayment(payment: Payment) {
        this.selectedPaymentForEdit = payment;
        this.isPaymentReadOnly.set(true);
        this.isAddPaymentModalOpen = true;
    }

    onDeletePayment(payment: Payment) {
        this.payments = this.payments.filter(p => p.id !== payment.id);

        this.payments = this.payments.map((p, index) => ({
            ...p,
            no: index + 1
        }));

        if (this.paymentTable) {
            const totalPages = this.paymentTable.totalPages();
            if (this.paymentTable.currentPage() > totalPages && totalPages > 0) {
                this.paymentTable.currentPage.set(totalPages);
            } else if (totalPages === 0) {
                this.paymentTable.currentPage.set(1);
            }
        }
    }

    onDeleteSelectedPayments(selectedPayments: Payment[]) {
        const selectedIds = new Set(selectedPayments.map(p => p.id));
        this.payments = this.payments.filter(p => !selectedIds.has(p.id));

        this.payments = this.payments.map((p, index) => ({
            ...p,
            no: index + 1
        }));

        if (this.paymentTable) {
            const totalPages = this.paymentTable.totalPages();
            if (this.paymentTable.currentPage() > totalPages && totalPages > 0) {
                this.paymentTable.currentPage.set(totalPages);
            } else if (totalPages === 0) {
                this.paymentTable.currentPage.set(1);
            }
        }
    }

    onPaymentSaved(paymentData: Record<string, string>) {
        if (this.selectedPaymentForEdit) {
            const index = this.payments.findIndex(p => p.id === this.selectedPaymentForEdit!.id);
            if (index !== -1) {
                const updatedPayments = [...this.payments];
                updatedPayments[index] = { ...updatedPayments[index], ...paymentData };
                this.payments = updatedPayments;
            }
        } else {
            const newId = this.payments.length > 0 ? Math.max(...this.payments.map(p => p.id)) + 1 : 1;
            const newNo = this.payments.length > 0 ? Math.max(...this.payments.map(p => p.no)) + 1 : 1;
            const newPayment: Payment = {
                id: newId,
                no: newNo,
                invoiceNumber: paymentData['invoiceNumber'],
                patientName: paymentData['patientName'],
                amount: Number(paymentData['amount']),
                date: paymentData['date'],
                method: paymentData['method'] as Payment['method'],
                status: paymentData['status'] as Payment['status'],
                selected: false
            };
            this.payments = [...this.payments, newPayment];
        }

        this.isAddPaymentModalOpen = false;

        if (this.paymentTable) {
            if (!this.selectedPaymentForEdit) {
                this.paymentTable.goToPage(this.paymentTable.totalPages());
            }
        }
    }
}
