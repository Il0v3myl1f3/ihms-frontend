# Dashboard Design System & Style Guide

Acest document descrie standardele vizuale și regulile de stil aplicate în cadrul dashboard-ului IHMS pentru a asigura o experiență de utilizator premium și consistentă.

## 1. Paleta de Culori

### Culori Principale
- **Primary Blue (`#1F2B6C`)**: Folosită pentru acțiuni principale, titluri de secțiuni, stări active și elemente de branding.
  - *Utilizare*: `text-[#1F2B6C]`, `bg-[#1F2B6C]`, `focus:border-[#1F2B6C]`, `ring-[#1F2B6C]`.
- **Secondary Blue (`#159EEC`)**: Folosită pentru elemente de accent sau hover secundar.
  - *Utilizare*: `hover:text-[#159EEC]`, `bg-[#159EEC]`.

### Culori Neutre și Fundaluri
- **Fundal Dashboard (`#FDFDFD`)**: Toate paginile din interiorul dashboard-ului (conținutul principal) folosesc acest alb pur pentru a evidenția cardurile și tabelele.
  - *Cod*: `bg-[#FDFDFD]`
- **Borders Tabele și Containere (`border-gray-300`)**: Am înlocuit griul deschis cu unul mai definit pentru a separa clar datele.
  - *Cod*: `border-gray-300` (Esențial pentru `thead`, `td`, `div` containere).
- **Meniuri Dropdown și Modale**: Fundal `white` cu border discret.
  - *Cod*: `bg-white border-gray-300`
  - *Shadow*: `shadow-[0_4px_20px_rgba(0,0,0,0.08)]`

## 2. Elemente Ce Trebuie Modificate (Checklist)

Dacă creezi o pagină nouă, asigură-te că verifici următoarele elemente:
1.  **Containerul Principal**: Trebuie să aibă `bg-[#FDFDFD]` și `min-h-screen`.
2.  **Tabelele**:
    - `thead`: Trebuie să aibă `bg-gray-50/50` și `border-b border-gray-300`.
    - `td`: Trebuie să aibă `border-r border-gray-300` pentru structura de tip grid.
    - `tr`: Adaugă `hover:bg-gray-50/30` pentru interactivitate.
3.  **Meniuri de Acțiuni (Action Dropdowns)**:
    - Verifică să aibă `fixed` și `z-9999` (pentru a nu fi tăiate de scroll-ul tabelului).
    - Border-ul să fie `gray-300`.
4.  **Butoane de Filtrare**:
    - Border `gray-300`, background `white` pe starea normală.
    - Când filtrul este activ: `border-[#1F2B6C]`, dar textul rămâne `gray-700` sau `gray-500` (nu își schimbă culoarea textului).

### Săgeți de Dropdown (ChevronDown)
Toate iconițele de tip "arrow" pentru meniuri dropdown trebuie să urmeze acest model pentru a asigura o animație fluidă și o aliniere perfectă.

#### Fix-ul Aplicat:
Anterior, săgețile aveau clase care împiedicau rotația corectă sau stricau alinierea. Fix-ul a constat în:
1.  **Eliminarea `ml-1` și `inline-block`**: Aceste clase forțau o poziționare rigidă care făcea rotația să pară "sărită" sau deplasată.
2.  **Punctul de Pivot (`origin-center`)**: Esențial pentru ca iconița să se rotească în jurul propriei axe, nu dintr-un colț.
3.  **Tranziția (`transition-transform duration-200`)**: Definește viteza și tipul animației. Am ales `200ms` pentru un feeling rapid dar fluid.
4.  **Starea Reactivă (`[class.rotate-180]`)**: Folosirea directă a clasei Tailwind în funcție de starea variabilei din Angular.

#### Implementare Corectă:
```html
<lucide-icon 
  [img]="ChevronDown" 
  class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 origin-center" 
  [class.rotate-180]="activeMenu() === 'nume_meniu'"
></lucide-icon>
```

#### De ce folosim acest fix?
Fără `origin-center`, iconița Lucide s-ar roti plecând de la punctul (0,0) al SVG-ului, ceea ce ar crea un efect de balansare (wobble). Prin fix-ul nostru, săgeata rămâne centrată perfect în timpul rotației la 180 de grade.

### Butoane de Filtrare (Table Header)
- **Stare Focus/Activă**: Textul nu trebuie să își schimbe culoarea la click (rămâne gri/negru), dar border-ul devine albastru.
- **Shadow**: Un shadow subtil pentru profunzime.
- **Implementare**:
```html
<button class="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus:border-[#1F2B6C] focus:outline-none">
  <!-- Content -->
</button>
```

### Meniuri Dropdown (Action Menus)
- **Poziționare**: `fixed` pentru a evita problemele de stacking în tabele.
- **Shadow**: `shadow-[0_4px_20px_rgba(0,0,0,0.08)]`.
- **Border**: `border border-gray-300`.
- **Padding**: `py-1` pentru container, `px-3 py-1.5` pentru itemi.

## 3. Formulare și Input-uri
- **Typography**: Se folosește `font-semibold` pentru valoarea textului din input-uri pentru lizibilitate sporită.
- **Focus State**: `focus:border-[#1F2B6C]` și `transition-all`.
- **Borders**: Întotdeauna `border-gray-300`.

## 4. Tabele
- **Header**: Fundal `bg-gray-50/50` cu border inferior `border-gray-300`.
- **Cell Divider**: `border-r border-gray-300` pentru o structură clară de tip grid (opțional în funcție de pagină).
- **Hover Row**: `hover:bg-gray-50/30` pentru feedback vizual la trecerea mouse-ului.

## Cum se reface un element conform noului stil?
Dacă adaugi o pagină nouă sau un modul:
1. Schimbă orice `border-gray-100` sau `border-gray-200` în `border-gray-300`.
2. Asigură-te că fundalul paginii este `bg-[#FDFDFD]`.
3. Pentru butoanele principale, folosește `bg-[#1F2B6C]` cu `text-white` și `font-semibold`.
4. Pentru dropdown-uri, verifică să ai animația de rotație pe `ChevronDown` folosind `duration-200`.
5. Rulează `npx prettier --write <cale-fisier>` pentru a menține structura codului curată.
