import { Component, ViewChild, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RoomTableComponent, Room } from './room-table/room-table.component';
import { RoomCreateModalComponent } from './room-create-modal/room-create-modal.component';
import { RoomService } from '../../../../services/room.service';

@Component({
    selector: 'app-room-list-page',
    imports: [RoomTableComponent, RoomCreateModalComponent],
    templateUrl: './room-list-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomListPageComponent {
    private roomService = inject(RoomService);
    @ViewChild(RoomTableComponent) roomTable!: RoomTableComponent;

    rooms: Room[] = [];

    constructor() {
        this.loadRooms();
    }

    private loadRooms() {
        this.roomService.getRooms().subscribe((r: Room[]) => this.rooms = r);
    }

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
        this.roomService.deleteRoom(room.id);
        this.loadRooms();

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
        this.roomService.deleteSelectedRooms(selectedRooms.map(r => r.id));
        this.loadRooms();

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
        this.roomService.saveRoom({
            ...roomData,
            id: this.selectedRoomForEdit?.id
        });
        this.loadRooms();

        this.isAddRoomModalOpen = false;

        if (this.roomTable) {
            if (!this.selectedRoomForEdit) {
                this.roomTable.goToPage(this.roomTable.totalPages());
            }
        }
    }
}
