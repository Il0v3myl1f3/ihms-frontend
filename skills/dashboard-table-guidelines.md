# Dashboard Table Styling Guidelines

This document outlines the standard patterns for creating and styling dashboard tables within the IHMS project. Follow these rules to ensure visual consistency and high-quality user experience across all admin dashboard pages.

## Page Layout & Header
Every dashboard page should follow this structural hierarchy:
- **Title**: Use `text-display-2` with the dark blue color `#1F2B6C`.
- **Subtitle**: Use `text-sm text-gray-500` for status updates or descriptions.
- **Main Action**: Use a primary blue button (`bg-[#159EEC]`) with `rounded-lg text-sm font-medium`.

## Table Structure

### 1. General Configuration
- **Container**: The table should be wrapped in a `div` with `flex-auto overflow-y-auto w-full` to handle scrollable content.
- **Table Element**: Use `w-full text-left min-w-[900px] border-collapse`.
- **Borders**: Apply vertical borders to all cells using `#f0f0f0`.
  ```css
  table th, table td {
      border: 1px solid #f0f0f0;
  }
  ```

### 2. Header Style
- **Background**: Use `bg-gray-50/50` for the `<thead>`.
- **Text**: Header labels should be `text-sm font-medium text-gray-400 whitespace-nowrap`.
- **Padding**: Use `px-4 py-3.5` for all header cells.

### 3. Column Composition
- **Index Column (Checkbox + No)**: Combine the selection checkbox and the row number into a single column to reduce visual noise.
  - Use `flex items-center gap-5` for the layout.
  - Header should contain the "Select All" checkbox and the "No" label.
- **Data Columns**: Default cell styling: `px-4 py-4 text-gray-700 font-medium text-sm`.
- **Action Column (The "Three Dots")**: 
  - Width: Set a fixed width of `w-14`.
  - Content: Use the `MoreHorizontal` icon inside a discrete hover-enabled button.
  - Sticky Position: If horizontal scrolling is expected, use `sticky right-0 bg-white`.

## Components & Interactivity

### 1. Checkboxes
- **Style**: Use the primary blue theme for selection.
  - Classes: `rounded border-gray-300 text-[#159EEC] focus:border-[#159EEC] focus:ring focus:ring-[#159EEC] focus:ring-opacity-50`.
  - **Note**: Ensure `shadow-sm` is removed for a modern flat look.

### 2. Actions Dropdown
- **Logic**: Use an `activeDropdownId` state (number or string) to track which menu is open.
- **Overlay Management**: Implement a `(document:click)` host listener to close the dropdown when clicking outside.
- **Icons**: Use Lucide icons: `MoreHorizontal` (trigger), `Pencil` (Edit), and `Trash2` (Delete).

### 3. Pagination Footer
- **Layout**: `flex items-center justify-between` with `bg-white` and a top border.
- **Items**:
  - Left: `Page X of Y` in `text-sm font-medium text-gray-700`.
  - Right: Navigation buttons using `Lucide` icons.
- **Active State**: Use `bg-[#159EEC] text-white border-[#159EEC]` for the current page number.
- **Responsive Row Scaling**: Implement dynamic `pageSize` based on breakpoints:
  - **> 1920px (Ultra HD)**: 10 rows per page.
  - **> 1024px (Standard)**: 7 rows per page.
  - **<= 1024px (Tablet/Small)**: 5 rows per page.
- **UX Range Limits**: To handle large numbers of pages, visually limit the displayed numbers using ellipses (`...`). Show a maximum of 5 distinct elements (e.g., `1, ..., 4, ..., 10`) at a time to prevent UI clutter.
- **Bounds Safety**: Ensure that when a window resize alters the `totalPages`, logic exists to reset the `currentPage` to `1` if the user is suddenly left on an out-of-bounds page.
- **State Updates**: Handle dynamic resizes efficiently via an Angular `@HostListener('window:resize')`.

## Reusable Search Implementation

To implement search in any dashboard table, follow this reactive signal-based pattern:

### 1. Component Logic (.ts)
Add a `searchQuery` signal, a `filteredItems` computed signal, and an `effect` to reset the current page when the search query changes.

```ts
// 1. Signal for the query
searchQuery = signal('');

// 2. Computed for filtered data
filteredItems = computed(() => {
  const query = this.searchQuery().toLowerCase().trim();
  const rawItems = this.items(); // The raw input() data
  if (!query) return rawItems;

  return rawItems.filter(item =>
    // List all searchable fields
    ['field1', 'field2', 'field3'].some(field =>
      String(item[field] ?? '').toLowerCase().includes(query)
    )
  );
});

// 3. Reset pagination on search
constructor() {
  effect(() => {
    this.searchQuery(); // track the query
    untracked(() => this.currentPage.set(1));
  });
}
```

### 2. Template Integration (.html)
Bind the search `<input>` directly to the `searchQuery` signal using the `(input)` event.

```html
<input type="text" 
       placeholder="Search"
       (input)="searchQuery.set($any($event.target).value)"
       class="...">
```

### 3. Pagination Chaining
Ensure that `totalPages` and `paginatedItems` derive their state from `filteredItems()` instead of the raw input data.

```ts
totalPages = computed(() => {
  return Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize()));
});

paginatedItems = computed(() => {
  const startIndex = (this.currentPage() - 1) * this.pageSize();
  return this.filteredItems().slice(startIndex, startIndex + this.pageSize());
});
```
