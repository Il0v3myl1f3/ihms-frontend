# Dashboard Table Styling Guidelines

This document outlines the standard patterns for creating and styling dashboard tables within the IHMS project. Follow these rules to ensure visual consistency and high-quality user experience across all admin dashboard pages.

---

## 1. Fonts & Typography

| Usage | Tailwind / CSS Class |
|---|---|
| **Page title** (h2) | `.text-dashboard-title`, `text-[#1F2B6C]`, `tracking-tight` |
| **Page subtitle** | `text-sm`, `text-gray-500` |
| **Table header labels** | `text-sm`, `text-gray-600`, `font-normal`, `whitespace-nowrap` |
| **Table body cells** | `text-sm`, `text-gray-900`, `font-normal` |
| **Filter / toolbar buttons** | `text-sm`, `text-gray-500` |
| **Pagination text** | `text-[13px]`, `text-gray-500` |
| **Dropdown menu items** | `text-xs`, `text-gray-700` |

---

## 2. Color Palette

### Primary Palette

| Token | Hex | Usage |
|---|---|---|
| **Dark Blue** | `#1F2B6C` | Page title, active sort headers, "Add" button bg, active page number bg |
| **Dark Blue hover** | `#151D4A` | "Add" button hover |
| **Accent Blue** | `#159EEC` | Search focus ring/border, checkbox accent, active page-size selector bg, active filter ring |

### Neutral Grays (Tailwind scale)

| Class | Usage |
|---|---|
| `text-gray-900` | Table body text (all data columns) |
| `text-gray-700` | Dropdown menu items, page-size button text |
| `text-gray-600` | Table header labels, inactive page numbers |
| `text-gray-500` | Page subtitle, filter buttons, pagination info |
| `text-gray-400` | Icons (filter, search, chevrons), inactive sort indicators, action "⋯" button |
| `text-gray-300` | Unsorted column chevron icon, disabled pagination button |
| `border-gray-200` | Input borders, filter button borders, pagination button borders, table row bottom borders |
| `border-gray-100` | Table container border, pagination/config bar top/bottom borders, table cell vertical borders, dropdown separator |
| `bg-gray-50/50` | Table header row background |
| `bg-gray-50/30` | Table row hover background |
| `bg-gray-50/20` | Search input subtle background tint |

### Semantic Colors

| Color | Usage |
|---|---|
| **Emerald** (`bg-emerald-50`, `text-emerald-700`) | Selected filter option highlight |
| **Red** (`bg-red-50`, `text-red-600`, `border-red-200`) | "Delete Selected" button, delete dropdown item |
| **White** | Table body bg, dropdown bg, action column sticky bg, pagination button bg |

---

## 4. Table Structure

### 4.1 Borders

```css
table { border-collapse: collapse; }

table th, table td {
    border-right: 1px solid #e5e7eb;  /* gray-200 vertical dividers */
    border-bottom: 1px solid #e5e7eb; /* gray-200 row dividers */
}

table th:last-child, table td:last-child {
    border-right: none; /* no right border on the Action column */
}
```

### 4.2 Header Row

- `<thead class="bg-gray-50/50 border-b border-gray-200">`
- Each `<th>`: `px-4 py-4 text-sm font-normal text-gray-600 whitespace-nowrap overflow-hidden`.
### 4.3 Column Composition

- **Index Column (Checkbox + No)**: Combined into one cell (`flex items-center gap-3`). Checkbox 3.5×3.5 + "No" label with sort icon.
- **Data Columns**: `px-4 py-4 text-gray-900`.
- **Action Column**: `w-[6%] text-center`, uses `MoreHorizontal` Lucide icon in a `p-1.5` button.

### 4.4 Sortable Headers

Clickable sort headers use this pattern:
- **Default state**: `text-gray-600 font-normal` with a faded `ChevronDown` (`text-gray-300`).
- **Active sort column**: `text-[#1F2B6C] font-semibold` with a `ChevronDown` or `ChevronUp` (`text-[#1F2B6C]`).
- **Hover**: `hover:text-[#1F2B6C] transition-colors`.
- **Icon size**: `w-3 h-3`.

### 4.5 Sticky Action Column

The last column (Action) is sticky when the table scrolls horizontally:
```css
table th:last-child, table td:last-child {
    position: sticky;
    right: 0;
    z-index: 1;
}
table th:last-child { background: #f9fafb; box-shadow: -4px 0 8px -4px rgba(0,0,0,0.06); }
table td:last-child { background: white;   box-shadow: -4px 0 8px -4px rgba(0,0,0,0.06); }
tr:hover td:last-child { background: #f9fafb; }
```

### 4.6 Table Body Rows

- `<tbody class="text-sm text-gray-900 font-normal bg-white">`
- Each `<tr>`: `hover:bg-gray-50/30 group whitespace-nowrap transition-colors border-b border-gray-200 last:border-0 text-sm`.

---

## 5. Config/Toolbar Bar

### 5.1 Search Input

- Full width on mobile, `lg:max-w-sm` on desktop.
- Left Lucide `Search` icon (`h-4 w-4 text-gray-400`), pointer-events-none overlay.
- Input: `pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 bg-gray-50/20`.
- Focus: `focus:ring-1 focus:ring-[#159EEC] focus:border-[#159EEC]`.

### 5.2 Filter Buttons (Gender, Blood Type)

- Base: `flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]`.
- Active state: `ring-1 ring-[#159EEC]`, chevron rotated 180°.
- Dropdown: `absolute top-full mt-1 z-50 w-40 bg-white border border-gray-100 rounded-lg shadow-lg py-1 max-h-60 overflow-auto slim-scroll`.
- Selected option: `bg-emerald-50 text-emerald-700`.

### 5.3 Action Buttons

- **Delete Selected** (conditional): `bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg text-sm font-medium border border-red-200`, with `Trash2` icon.
- **Add [Entity]**: `bg-[#1F2B6C] hover:bg-[#151D4A] text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm`, with `Plus` icon.

---

## 6. Actions Dropdown

The dropdown is rendered **outside the table** (`fixed z-9999`) to escape the stacking context created by sticky columns:

- Container: `fixed z-9999 w-28 bg-white rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 py-1`.
- Position: Calculated via `getBoundingClientRect()` → `top: btn.bottom + 4`, `right: window.innerWidth - btn.right`.
- Items: `px-3 py-1.5 text-xs font-normal text-gray-700 hover:bg-gray-50`, with Lucide icons (3.5×3.5).
- Delete item: `text-red-600 hover:bg-red-50`.
- Separator: `h-px bg-gray-100 my-1 w-full` div between edit and delete.
- Close triggers: `(document:click)` host listener, `window:scroll` host listener.

---

## 7. Pagination Footer

### 7.1 Layout

- `px-4 lg:px-5 py-4 border-t border-gray-100`.
- `flex flex-col sm:flex-row items-center justify-center lg:justify-between`.
- Left side (`.pagination-info`): Page-size selector + "out of N" text.
- Right side: Page number buttons + prev/next arrows.

### 7.2 Page-Size Selector

- Styled as a custom button mimicking a `<select>`: `px-3 py-1.5 pr-8 border border-gray-200 rounded-lg bg-white text-gray-700 text-[13px] min-w-16`.
- Dropdown pops **upward** (`absolute bottom-full mb-1`).
- Available sizes: `[5, 7, 10, 20, 50]`.
- Active size: `bg-[#159EEC] text-white`.

### 7.3 Page Number Buttons

- Size: `w-8 h-8 rounded-lg text-[13px]`.
- Active page: `bg-[#1F2B6C] text-white border-transparent`.
- Inactive page: `bg-white border border-gray-200 text-gray-600 hover:bg-gray-50`.
- Ellipsis: `text-gray-400 text-[13px]`.
- Prev/Next: `w-8 h-8 rounded-lg border border-gray-200`, disabled state `text-gray-300 cursor-not-allowed`.
- Max 5 visible elements with ellipsis logic: `[1, 2, 3, '...', total]`, `[1, '...', current, '...', total]`, `[1, '...', n-2, n-1, n]`.

---

## 8. Responsive / Media Query Behavior

### Breakpoint: `max-width: 1024px`

Applied via the component CSS `@media (max-width: 1024px)`:

| Element | Change |
|---|---|
| **Inputs & buttons** | Font-size shrinks to `0.75rem` (12px) |
| **Search input** | Vertical padding reduced to `0.375rem` |
| **Table layout** | Switches to `table-layout: auto` |
| **Table cells** (`th`, `td`) | Padding `0.5rem` horizontal, font-size `0.8125rem` (13px) |
| **Address column** | **Hidden** (`display: none`) — 5th child `th:nth-child(5)`, `td:nth-child(5)` |
| **Page-size selector** (`.pagination-info`) | **Hidden** (`display: none !important`) |
| **Table header overflow** | Set to `overflow: visible` (so sort icons are not clipped) |

### Tailwind Responsive Utilities (in HTML)

| Breakpoint | Behavior |
|---|---|
| `sm:` (640px+) | Header switches from column to row (`sm:flex-row sm:items-center`). Pagination footer switches to row. |
| `lg:` (1024px+) | Config bar padding increases (`p-4` → `lg:p-6`). Search input gets max-width (`lg:max-w-sm`). Config bar switches to row (`lg:flex-row lg:items-center`). Pagination justified between (`lg:justify-between`). Pagination horizontal padding increases (`lg:px-5`). |

### Programmatic Responsive Logic

- `@HostListener('window:resize')` calls `checkResponsiveSettings()`.
- On `window.innerWidth < 1024`: forces `pageSize` to `7`.
- Bounds-safety: After deleting rows, if `currentPage > totalPages`, reset to `totalPages`.

---

## 9. Slim Scrollbar (Custom)

Used on filter dropdowns (`.slim-scroll`):

```css
.slim-scroll::-webkit-scrollbar { width: 6px; }
.slim-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 0.5rem; margin: 4px 0; }
.slim-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 0.5rem; }
.slim-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
.slim-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
```

---

## 10. Checkboxes

- Size: `w-3.5 h-3.5`.
- Styling: `rounded border-gray-100 text-[#159EEC] focus:ring-0 focus:ring-offset-0 cursor-pointer`.
- "Select all" checkbox in the header, per-row checkbox in body cells.
- State managed via `selectAll` boolean and `patient.selected` per row.

---

## 11. Reusable Search Implementation

### Component Logic (.ts)
```ts
searchQuery = signal('');

filteredItems = computed(() => {
  const query = this.searchQuery().toLowerCase().trim();
  let result = this.items();
  if (query) {
    result = result.filter(item =>
      ['field1', 'field2', 'field3'].some(field =>
        String(item[field as keyof Item] ?? '').toLowerCase().includes(query)
      )
    );
  }
  // ... apply other filters, sorting ...
  return result;
});

constructor() {
  effect(() => {
    this.searchQuery();
    untracked(() => this.currentPage.set(1));
  });
}
```

### Template (.html)
```html
<input type="text"
       placeholder="Search name, ID, etc"
       (input)="searchQuery.set($any($event.target).value)"
       class="...">
```

### Pagination Chaining
```ts
totalPages = computed(() =>
  Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize()))
);

paginatedItems = computed(() => {
  const start = (this.currentPage() - 1) * this.pageSize();
  return this.filteredItems().slice(start, start + this.pageSize());
});
```

---

## 12. Filter Dropdowns

- Managed by an `activeFilterMenu` signal (`string | null`).
- Toggle: `toggleFilterMenu(menu, $event)` — stops propagation, toggles the menu name.
- Set filter: `setFilter(type, value)` — sets the filter signal, closes menu, resets page to 1.
- Available options are computed from the data itself (`availableGenders`, `availableBloodTypes`), always prefixed with `'All'`.

---

## 13. Create/Edit Modal Pattern

- Uses a shared `<app-modal>` wrapper.
- Conditional title: `patientToEdit ? 'Edit Patient' : 'Add New Patient'`.
- Form layout: `grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5`.
- Input styling: `border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500`.
- Labels: `text-sm font-medium text-gray-700 mb-1.5`.
- Footer: Cancel (ghost style) + Submit (`bg-blue-600 disabled:bg-gray-400`).
