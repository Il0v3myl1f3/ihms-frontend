import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Room } from '../components/pages/dashboard/rooms/room-table/room-table.component';

export const MOCK_ROOMS: Room[] = [
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
    { id: 11, no: 11, roomNumber: 'C-303', type: 'Suite', floor: 3, capacity: 4, status: 'Available', pricePerDay: 650.00, selected: false }
];

@Injectable({
    providedIn: 'root'
})
export class RoomService {
    private roomsSignal = signal<Room[]>([...MOCK_ROOMS]);

    getRooms(): Observable<Room[]> {
        return of(this.roomsSignal());
    }

    getRoomStats(): { total: number, occupied: number, available: number } {
        const rooms = this.roomsSignal();
        return {
            total: rooms.length,
            occupied: rooms.filter(r => r.status === 'Occupied').length,
            available: rooms.filter(r => r.status === 'Available').length
        };
    }

    deleteRoom(id: number): void {
        this.roomsSignal.update(rooms => rooms.filter(r => r.id !== id));
    }

    deleteSelectedRooms(ids: number[]): void {
        const idSet = new Set(ids);
        this.roomsSignal.update(rooms => rooms.filter(r => !idSet.has(r.id)));
    }

    saveRoom(data: Record<string, any>): void {
        this.roomsSignal.update(rooms => {
            if (data['id']) {
                const index = rooms.findIndex(r => r.id === data['id']);
                if (index !== -1) {
                    const updated = [...rooms];
                    updated[index] = { ...updated[index], ...data };
                    return updated;
                }
            } else {
                const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
                const newNo = rooms.length > 0 ? Math.max(...rooms.map(r => r.no)) + 1 : 1;
                const newRoom: Room = {
                    id: newId,
                    no: newNo,
                    roomNumber: data['roomNumber'],
                    type: data['type'],
                    floor: Number(data['floor']),
                    capacity: Number(data['capacity']),
                    status: data['status'],
                    pricePerDay: Number(data['pricePerDay']),
                    selected: false
                };
                return [...rooms, newRoom];
            }
            return rooms;
        });
    }
}
