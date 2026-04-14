## Plan: Refactorizare Dropdown-uri în Modalele Lab Equipment

Acest plan detaliază pașii pentru a înlocui elementele native `<select>` (pentru Laborator și Status) din modalele de **Adăugare** și **Editare** echipament cu dropdown-uri personalizate, respectând stilizarea IHMS.

### 1. Actualizare Stat în Componentă (`lab-equipment-page.component.ts`)
- Adăugarea semnalelor pentru controlul vizibilității dropdown-urilor în modale:
  - `activeEditLabDropdown = signal(false)`
  - `activeEditStatusDropdown = signal(false)`
  - `activeAddLabDropdown = signal(false)`
  - `activeAddStatusDropdown = signal(false)`
- Implementarea metodelor de interacțiune:
  - `toggleModalDropdown(type: string, event: Event)`: Pentru deschiderea/închiderea meniurilor.
  - `selectLab(item: any, isEdit: boolean)`: Pentru selectarea laboratorului și actualizarea ID-ului/numelui în `newItem` sau `selectedItemForEdit`.
  - `selectStatus(status: string, isEdit: boolean)`: Pentru actualizarea statusului.
- Extinderea metodei `closeDropdown()` pentru a reseta toate aceste semnale la `false`.

### 2. Modificări în Template - Modal Editare (`lab-equipment-page.component.html`)
- Înlocuirea `<select>` pentru **Laboratory** cu:
  - Un buton stilizat (iconiță `MapPin`, nume laborator curent, iconiță `ChevronDown`).
  - Un meniu absolut care mapează `availableLabs()`.
- Înlocuirea `<select>` pentru **Status** cu:
  - Un buton stilizat (iconiță `Activity`, status curent, iconiță `ChevronDown`).
  - Un meniu absolut cu opțiunile: Operational, Under Maintenance, Out of Service.

### 3. Modificări în Template - Modal Adăugare (`lab-equipment-page.component.html`)
- Aplicarea aceleiași structuri ca la Editare, dar legată la semnalul `newItem()`.
- Afișarea unui text de tip "Select Laboratory" dacă `labId` nu este setat.

### 4. Detalii Stilizare și UX
- **Consistență**: Utilizarea acelorași clase Tailwind ca la filtrele de pagină (borduri `gray-200`, focus `blue-500`, aspect modern).
- **Z-Index**: Asigurarea că meniurile dropdown apar deasupra conținutului modalului.
- **Iconițe**: Folosirea iconițelor relevante în interiorul selectoarelor pentru o identificare rapidă.

### 5. Verificare
- Testarea funcționării în ambele modale.
- Verificarea actualizării corecte a datelor la salvare (Add/Save Changes).
- Confirmarea închiderii automate la click în afara selectorului (în interiorul sau exteriorul modalului).

