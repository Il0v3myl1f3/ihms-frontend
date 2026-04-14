## Plan: Implementation of "Add Asset" for Lab Equipment

This plan outlines the steps to add the "Add Asset" functionality for laboratory equipment in the dashboard.

### 1. State Management in Component
- Add a new signal `isAddModalOpen = signal(false)` to `LabEquipmentPageComponent`.
- Add a new signal `newItem = signal<Partial<LabEquipment>>({})` to hold the temporary data for the new equipment.

### 2. Component Logic
- **`openAddModal()`**:
  - Initializes `newItem` with default values:
    ```typescript
    {
      status: 'Operational',
      labId: this.availableLabs()[0]?.id,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextMaintenanceDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
    }
    ```
  - Sets `isAddModalOpen(true)`.
- **`saveAdd()`**:
  - Validates that required fields (Name, labId, Type) are present.
  - Generates a new `id` (max existing ID + 1) and `no` (max existing No + 1).
  - Finds the `labName` from `availableLabs` based on the selected `labId`.
  - Updates the `items` signal: `this.items.update(prev => [fullNewItem, ...prev])`.
  - Sets `isAddModalOpen(false)`.
- **`closeAddModal()`**:
  - Sets `isAddModalOpen(false)`.

### 3. Template Updates
- Update the "Add Asset" button in the toolbar to call `openAddModal()`.
- Add a NEW `<app-modal>` component at the end of `lab-equipment-page.component.html` for adding:
  - **Title**: "Add New Asset".
  - **Body (`modal-body`)**:
    - Form with inputs for:
      - Equipment Name (`text`)
      - Laboratory (`select` - using `availableLabs`)
      - Type (`text`)
      - Status (`select`)
      - Last Maintenance (`date`)
      - Next Maintenance (`date`)
  - **Footer (`modal-footer`)**:
    - "Cancel" button (calls `closeAddModal`).
    - "Add Asset" button (calls `saveAdd`, highlighted in navy).

### 4. Implementation Details
- Ensure consistent styling using the Navy/Blue palette.
- Reuse `availableLabs` signal.
- Added record should appear at the top of the list for immediate visibility.

### 5. Verification
- Click "Add Asset".
- Fill in the form.
- Click "Add Asset" in the modal.
- Verify the new item appears in the table.
- Verify cancellation works.
