## Plan: Implementation of "View Details" for Lab Equipment

This plan outlines the steps to add a detailed viewing functionality for laboratory equipment in the dashboard.

### 1. State Management in Component
- Add a new signal `isDetailsModalOpen = signal(false)` to `LabEquipmentPageComponent`.
- Add a new signal `selectedItemForDetails = signal<LabEquipment | null>(null)` to hold the equipment being viewed.

### 2. Component Logic
- Implement `viewDetails(item: LabEquipment)`:
    - Sets `selectedItemForDetails` with the provided item.
    - Sets `isDetailsModalOpen(true)`.
    - Closes the actions dropdown (`activeItem = null`).
- Implement `closeDetailsModal()`:
    - Sets `isDetailsModalOpen(false)`.
    - Sets `selectedItemForDetails(null)` after a short delay (for smooth transition).

### 3. Template Updates
- Import `ModalComponent` in `LabEquipmentPageComponent` imports array.
- Update the "View Details" button in the actions dropdown to call `viewDetails(activeItem!)`.
- Add the `<app-modal>` component at the end of `lab-equipment-page.component.html`:
    - Title: "Equipment Details".
    - `[isOpen]="isDetailsModalOpen()"`.
    - `(close)="closeDetailsModal()"`.
- Inside the modal, create a structured layout (grid) to display:
    - **Header/General Info**: Icon, Name, Equipment ID (No).
    - **Placement**: Laboratory name/ID.
    - **Category**: Equipment Type.
    - **Status**: Status badge (Operational, etc.).
    - **Maintenance Info**: Last Maintenance date and Next Maintenance date.

### 4. Styling
- Use the existing IHMS dashboard color palette (Navy #1F2B6C, Blue #159EEC).
- Ensure the modal is responsive and follows the same design language as other detail views in the app.

### 5. Verification
- Click "View Details" on an equipment row.
- Verify all data is correctly displayed in the modal.
- Verify the modal can be closed via the "X" button and backdrop click.
