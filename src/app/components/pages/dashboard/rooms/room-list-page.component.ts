import { Component, ViewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import { RoomTableComponent, Room } from './room-table/room-table.component';
import { RoomCreateModalComponent } from './room-create-modal/room-create-modal.component';

@Component({
    selector: 'app-room-list-page',
    imports: [RoomTableComponent, RoomCreateModalComponent],
    templateUrl: './room-list-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomListPageComponent {
    @ViewChild(RoomTableComponent) roomTable!: RoomTableComponent;

    rooms: Room[] = [
        { id: 1, no: 1, roomNumber: 'A-101', type: 'Single', floor: 1, capacity: 1, status: 'Available', pricePerDay: 150.00, selected: false },
        { id: 2, no: 2, roomNumber: 'A-102', type: 'Double', floor: 1, capacity: 2, status: 'Occupied', pricePerDay: 250.00, selected: false },
        { id: 3, no: 3, roomNumber: 'A-103', type: 'Single', floor: 1, capacity: 1, status: 'Maintenance', pricePerDay: 150.00, selected: false },
        { id: 4, no: 4, roomNumber: 'A-104', type: 'Suite', floor: 1, capacity: 3, status: 'Reserved', pricePerDay: 500.00, selected: false },
        { id: 5, no: 5, roomNumber: 'B-201', type: 'ICU', floor: 2, capacity: 1, status: 'Occupied', pricePerDay: 800.00, selected: false },
        { id: 6, no: 6, roomNumber: 'B-202', type: 'ICU', floor: 2, capacity: 1, status: 'Available', pricePerDay: 800.00, selected: false },
        { id: 7, no: 7, roomNumber: 'B-203', type: 'Double', floor: 2, capacity: 2, status: 'Available', pricePerDay: 250.00, selected: false },
        { id: 8, no: 8, roomNumber: 'B-204', type: 'Operating', floor: 2, capacity: 1, status: 'Occupied', pricePerDay: 1200.00, selected: false },
        { id: 9, no: 9, roomNumber: 'C-301', type: 'Single', floor: 3, capacity: 1, status: 'Available', pricePerDay: 175.00, selected: false },
        { id: 10, no: 10, roomNumber: 'C-302', type: 'Double', floor: 3, capacity: 2, status: 'Reserved', pricePerDay: 275.00, selected: false },
        { id: 11, no: 11, roomNumber: 'C-303', type: 'Suite', floor: 3, capacity: 4, status: 'Available', pricePerDay: 650.00, selected: false },
        { id: 12, no: 12, roomNumber: 'C-304', type: 'Single', floor: 3, capacity: 1, status: 'Occupied', pricePerDay: 175.00, selected: false },
        { id: 13, no: 13, roomNumber: 'D-401', type: 'Operating', floor: 4, capacity: 1, status: 'Available', pricePerDay: 1200.00, selected: false },
        { id: 14, no: 14, roomNumber: 'D-402', type: 'ICU', floor: 4, capacity: 1, status: 'Maintenance', pricePerDay: 800.00, selected: false },
        { id: 15, no: 15, roomNumber: 'D-403', type: 'Double', floor: 4, capacity: 2, status: 'Available', pricePerDay: 300.00, selected: false },
        { id: 16, no: 16, roomNumber: 'D-404', type: 'Single', floor: 4, capacity: 1, status: 'Occupied', pricePerDay: 180.00, selected: false },
        { id: 17, no: 17, roomNumber: 'E-501', type: 'Suite', floor: 5, capacity: 3, status: 'Available', pricePerDay: 550.00, selected: false },
        { id: 18, no: 18, roomNumber: 'E-502', type: 'Double', floor: 5, capacity: 2, status: 'Reserved', pricePerDay: 280.00, selected: false },
        { id: 19, no: 19, roomNumber: 'E-503', type: 'ICU', floor: 5, capacity: 1, status: 'Available', pricePerDay: 850.00, selected: false },
        { id: 20, no: 20, roomNumber: 'E-504', type: 'Single', floor: 5, capacity: 1, status: 'Occupied', pricePerDay: 160.00, selected: false },
        { id: 21, no: 21, roomNumber: 'F-601', type: 'Operating', floor: 6, capacity: 1, status: 'Maintenance', pricePerDay: 1300.00, selected: false },
        { id: 22, no: 22, roomNumber: 'F-602', type: 'Suite', floor: 6, capacity: 4, status: 'Available', pricePerDay: 700.00, selected: false },
        { id: 23, no: 23, roomNumber: 'F-603', type: 'Double', floor: 6, capacity: 2, status: 'Occupied', pricePerDay: 290.00, selected: false },
        { id: 24, no: 24, roomNumber: 'F-604', type: 'Single', floor: 6, capacity: 1, status: 'Available', pricePerDay: 170.00, selected: false },
        { id: 25, no: 25, roomNumber: 'G-701', type: 'ICU', floor: 7, capacity: 1, status: 'Reserved', pricePerDay: 900.00, selected: false }
    ];

    selectedRoomForEdit: Room | null = null;
    isAddRoomModalOpen = false;
    isRoomReadOnly = signal(false);

    openAddRoomModal() {
        this.selectedRoomForEdit = null;
        this.isRoomReadOnly.set(false);
        this.isAddRoomModalOpen = true;
    }

    closeAddRoomModal() {
        this.isAddRoomModalOpen = false;
    }

    onEditRoom(room: Room) {
        this.selectedRoomForEdit = room;
        this.isRoomReadOnly.set(false);
        this.isAddRoomModalOpen = true;
    }

    onViewRoom(room: Room) {
        this.selectedRoomForEdit = room;
        this.isRoomReadOnly.set(true);
        this.isAddRoomModalOpen = true;
    }

    onDeleteRoom(room: Room) {
        this.rooms = this.rooms.filter(r => r.id !== room.id);

        this.rooms = this.rooms.map((r, index) => ({
            ...r,
            no: index + 1
        }));

        if (this.roomTable) {
            const totalPages = this.roomTable.totalPages();
            if (this.roomTable.currentPage() > totalPages && totalPages > 0) {
                this.roomTable.currentPage.set(totalPages);
            } else if (totalPages === 0) {
                this.roomTable.currentPage.set(1);
            }
        }
    }

    onDeleteSelectedRooms(selectedRooms: Room[]) {
        const selectedIds = new Set(selectedRooms.map(r => r.id));
        this.rooms = this.rooms.filter(r => !selectedIds.has(r.id));

        this.rooms = this.rooms.map((r, index) => ({
            ...r,
            no: index + 1
        }));

        if (this.roomTable) {
            const totalPages = this.roomTable.totalPages();
            if (this.roomTable.currentPage() > totalPages && totalPages > 0) {
                this.roomTable.currentPage.set(totalPages);
            } else if (totalPages === 0) {
                this.roomTable.currentPage.set(1);
            }
        }
    }

    onRoomSaved(roomData: Record<string, string>) {
        if (this.selectedRoomForEdit) {
            const index = this.rooms.findIndex(r => r.id === this.selectedRoomForEdit!.id);
            if (index !== -1) {
                const updatedRooms = [...this.rooms];
                updatedRooms[index] = { ...updatedRooms[index], ...roomData };
                this.rooms = updatedRooms;
            }
        } else {
            const newId = this.rooms.length > 0 ? Math.max(...this.rooms.map(r => r.id)) + 1 : 1;
            const newNo = this.rooms.length > 0 ? Math.max(...this.rooms.map(r => r.no)) + 1 : 1;
            const newRoom: Room = {
                id: newId,
                no: newNo,
                roomNumber: roomData['roomNumber'],
                type: roomData['type'] as Room['type'],
                floor: Number(roomData['floor']),
                capacity: Number(roomData['capacity']),
                status: roomData['status'] as Room['status'],
                pricePerDay: Number(roomData['pricePerDay']),
                selected: false
            };
            this.rooms = [...this.rooms, newRoom];
        }

        this.isAddRoomModalOpen = false;

        if (this.roomTable) {
            if (!this.selectedRoomForEdit) {
                this.roomTable.goToPage(this.roomTable.totalPages());
            }
        }
    }
}
