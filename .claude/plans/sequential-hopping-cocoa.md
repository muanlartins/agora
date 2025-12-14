# Icon System Migration Plan

## Overview
Consolidate all icon usage in the codebase to use Angular Material Icons (`mat-icon`), replacing the current inconsistent mix of PNG images and inline SVGs.

---

## Current State (Problem)

The codebase uses **three different icon approaches**:

| Approach | Usage | Problems |
|----------|-------|----------|
| PNG images (`assets/*.png`) | delete.png, edit-text.png in debates, goals, tournament | Not scalable, hard to style, HTTP requests |
| Inline SVGs | members-table, landing-page, modals | Verbose, duplicated, hard to maintain |
| Text symbols | Goals/Articles headers (`+` icon) | Limited, inconsistent |

**Good news:** Material Icons font is already loaded in `index.html` but `MatIconModule` is not imported.

---

## Solution

Use `<mat-icon>` components throughout the app. Benefits:
- Single source of truth for icons
- Easy to style with CSS (color inherits from parent)
- Huge icon library (2000+ icons)
- Already have the font loaded
- Consistent with Angular Material components

---

## Implementation Steps

### Step 1: Enable MatIconModule

**File:** `src/app/app.module.ts`

Add `MatIconModule` to imports:
```typescript
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    // ... existing imports
    MatIconModule,
  ],
})
```

### Step 2: Replace Icons in Components

| Component | Current | Replace With |
|-----------|---------|--------------|
| members-table | Inline SVG (link, edit, delete) | `<mat-icon>link</mat-icon>`, `<mat-icon>edit</mat-icon>`, `<mat-icon>delete</mat-icon>` |
| debates-table | PNG images | `<mat-icon>edit</mat-icon>`, `<mat-icon>delete</mat-icon>` |
| debates-table empty state | Inline SVG calendar | `<mat-icon>event</mat-icon>` |
| goal-detail-modal | PNG images + inline SVG | `<mat-icon>edit</mat-icon>`, `<mat-icon>delete</mat-icon>`, `<mat-icon>close</mat-icon>` |
| goals-grid | Text `+` | `<mat-icon>add</mat-icon>` |
| articles-grid | Text `+` | `<mat-icon>add</mat-icon>` |
| tournament | PNG images | `<mat-icon>edit</mat-icon>`, `<mat-icon>delete</mat-icon>` |
| create-member-modal | Inline SVG close | `<mat-icon>close</mat-icon>` |
| members-table empty state | Inline SVG | `<mat-icon>group</mat-icon>` |
| login | Inline SVG arrow | `<mat-icon>arrow_back</mat-icon>` |
| landing-page | Inline SVG arrow | `<mat-icon>arrow_forward</mat-icon>` |

### Step 3: Update Button Styling

Update SCSS to style mat-icon instead of img/svg:

```scss
.action-button {
  mat-icon {
    font-size: 18px;
    width: 18px;
    height: 18px;
  }
}
```

### Step 4: Clean Up (Optional)

- Remove unused `NzIconModule` import from app.module.ts
- Delete unused PNG icon files (delete.png, edit-text.png) if no longer referenced

---

## Files to Modify

| File | Changes |
|------|---------|
| `app.module.ts` | Import MatIconModule |
| `members-table.component.html` | Replace inline SVGs with mat-icon |
| `members-table.component.scss` | Update icon styling |
| `debates-table.component.html` | Replace PNG imgs with mat-icon |
| `debates-table.component.scss` | Update icon styling |
| `goal-detail-modal.component.html` | Replace PNG imgs + SVG with mat-icon |
| `goals-grid.component.html` | Replace `+` text with mat-icon |
| `articles-grid.component.html` | Replace `+` text with mat-icon |
| `tournament.component.html` | Replace PNG imgs with mat-icon |
| `create-member-modal.component.html` | Replace SVG close with mat-icon |
| `login.component.html` | Replace SVG arrow with mat-icon |
| `landing-page.component.html` | Replace SVG arrow with mat-icon |

---

## Icon Reference

Common Material Icons to use:

| Action | Icon Name | Preview |
|--------|-----------|---------|
| Edit | `edit` | ✏️ |
| Delete | `delete` | 🗑️ |
| Close | `close` | ✕ |
| Add | `add` | + |
| Link/Copy URL | `link` | 🔗 |
| Back | `arrow_back` | ← |
| Forward | `arrow_forward` | → |
| Calendar | `event` | 📅 |
| People/Group | `group` | 👥 |
| Person | `person` | 👤 |

Full icon list: https://fonts.google.com/icons

---

## Implementation Order

1. Import MatIconModule in app.module.ts
2. Update members-table (already has inline SVGs to replace)
3. Update debates-table
4. Update goal-detail-modal
5. Update goals-grid and articles-grid
6. Update tournament component
7. Update create-member-modal
8. Update login and landing-page
9. Build and verify
10. Optional: Clean up unused imports/files
