## Plan: Implementation of "Edit" for Lab Equipment

This plan outlines the steps to add the "Edit" functionality for laboratory equipment in the dashboard.

### 1. State Management in Component
- Add a new signal `isEditModalOpen = signal(false)` to `LabEquipmentPageComponent`.
- Add a new signal `selectedItemForEdit = signal<LabEquipment | null>(null)` to hold the equipment being edited.
- Add a signal `availableLabs = signal<Laboratory[]>([])` to populate the lab selection dropdown.

### 2. Component Logic
- **`openEditModal(item: LabEquipment)`**: 
  - Creates a shallow copy of the item (`{ ...item }`) to avoid reactive updates before saving.
  - Sets `selectedItemForEdit` with the copy.
  - Sets `isEditModalOpen(true)`.
  - Closes the actions dropdown.
- **`saveEdit()`**:
  - Validates the form.
  - Updates the `items` signal by mapping over the existing items and replacing the one with the matching ID.
  - Closes the edit modal.
- **`closeEditModal()`**:
  - Sets `isEditModalOpen(false)`.
  - Optionally resets `selectedItemForEdit` after a delay.

### 3. Template Updates
- Import `FormsModule` (already imported) and ensure `ngModel` is ready.
- Update the "Edit" button in the actions dropdown to call `openEditModal(activeItem!)`.
- Add a NEW `<app-modal>` component at the end of `lab-equipment-page.component.html` for editing:
  - **Title**: "Edit Equipment".
  - **Body (`modal-body`)**:
    - Form with inputs for:
      - Name (`text`)
      - Laboratory (`select` - using `availableLabs`)
      - Type (`text`)
      - Status (`select` - Operational, Under Maintenance, Out of Service)
      - Last Maintenance (`date`)
      - Next Maintenance (`date`)
  - **Footer (`modal-footer`)**:
    - "Cancel" button (calls `closeEditModal`).
    - "Save Changes" button (calls `saveEdit`, highlighted in blue).

### 4. Implementation Details
- Ensure date inputs correctly handle the string format (YYYY-MM-DD).
- Apply consistent IHMS styling to form labels and inputs.
- Use `LaboratoryService.getLabs()` to populate the `availableLabs` signal in `ngOnInit`.

### 5. Verification
- Click "Edit" on an equipment row.
- Modify several fields in the modal.
- Click "Save Changes" and verify the table reflects the updates immediately.
- Verify cancellation doesn't apply changes.
