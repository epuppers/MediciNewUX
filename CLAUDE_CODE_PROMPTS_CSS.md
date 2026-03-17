# Medici App — CSS-to-Tailwind Migration Prompts

Port custom CSS classes from `app.css` into inline Tailwind utilities within React components, then delete the CSS rules from `app.css`.

**Critical global rules for every prompt:**
- Do NOT touch anything in the `Reference/` or `Scripts/` folders.
- The rendered output must not change visually — pixel-perfect preservation.
- Use Tailwind arbitrary value syntax with CSS variables: `bg-[var(--taupe-3)]`, NOT `bg-taupe-3`. The Medici design tokens are NOT registered in the Tailwind `@theme` block, so bare utility names like `bg-taupe-3` will NOT work.
- Keep CSS custom property definitions (`:root`, `.dark`, `@theme`, `@keyframes`) in `app.css` — we are only removing component class rules.
- When a CSS class has a `.dark` variant, use the `dark:` Tailwind modifier.
- When a CSS class has `:hover`, `:focus-visible`, `:active` variants, use the corresponding Tailwind modifiers.
- For parent-hover dependent visibility (e.g., `.card:hover .menu-btn`), add `group` to the parent element and use `group-hover:` on the child.
- For `:last-child` border removal, use the `last:` modifier.
- For `data-*` attribute selectors, keep a minimal CSS rule using `@apply` or leave as CSS — these cannot be expressed as Tailwind utilities.
- After each prompt, run `npm run build` to verify no TypeScript or build errors.
- Delete the CSS rules from `app.css` only AFTER confirming the inline Tailwind version renders correctly.

**Tailwind v4 arbitrary value syntax reference:**
```
bg-[var(--white)]           → background: var(--white)
text-[var(--taupe-5)]       → color: var(--taupe-5)
border-[var(--taupe-2)]     → border-color: var(--taupe-2)
font-[family-name:var(--mono)] → font-family: var(--mono)
text-[0.6875rem]            → font-size: 0.6875rem
tracking-[0.05em]           → letter-spacing: 0.05em
rounded-[var(--r-md)]       → border-radius: var(--r-md)
p-[14px]                    → padding: 14px
px-[10px]                   → padding-left/right: 10px
py-[7px]                    → padding-top/bottom: 7px
gap-[8px]                   → gap: 8px
bg-[rgba(var(--violet-3-rgb),0.1)] → rgba background
```

---

## PHASE 0 — Register Design Tokens in Tailwind Theme

Before migrating component classes, register the Medici custom tokens in the `@theme inline` block so we can use shorter utility names going forward. This is a ONE-TIME setup step.

---

### Prompt 0.1 — Extend @theme inline with Medici color tokens

```
In `app/app.css`, find the `@theme inline {` block (line 294). Add the following Medici color token registrations BEFORE the existing `--color-sidebar-ring` line:

  /* Medici design tokens */
  --color-taupe-1: var(--taupe-1);
  --color-taupe-2: var(--taupe-2);
  --color-taupe-3: var(--taupe-3);
  --color-taupe-4: var(--taupe-4);
  --color-taupe-5: var(--taupe-5);
  --color-berry-1: var(--berry-1);
  --color-berry-2: var(--berry-2);
  --color-berry-3: var(--berry-3);
  --color-berry-4: var(--berry-4);
  --color-berry-5: var(--berry-5);
  --color-blue-1: var(--blue-1);
  --color-blue-2: var(--blue-2);
  --color-blue-3: var(--blue-3);
  --color-violet-1: var(--violet-1);
  --color-violet-2: var(--violet-2);
  --color-violet-3: var(--violet-3);
  --color-violet-4: var(--violet-4);
  --color-violet-5: var(--violet-5);
  --color-chinese-1: var(--chinese-1);
  --color-chinese-2: var(--chinese-2);
  --color-chinese-3: var(--chinese-3);
  --color-chinese-4: var(--chinese-4);
  --color-chinese-5: var(--chinese-5);
  --color-white: var(--white);
  --color-off-white: var(--off-white);
  --color-green: var(--green);
  --color-red: var(--red);
  --color-amber: var(--amber);
  --color-surface-0: var(--surface-0);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);

This means Tailwind will now recognize `bg-taupe-3`, `text-violet-4`, `border-berry-2`, etc. as valid utility classes.

Also add font registrations if they are not already present:
  --font-pixel: 'ChicagoFLF', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  --font-sans: 'DM Sans', sans-serif;

And add border-radius tokens:
  --radius-r-xs: 2px;
  --radius-r-sm: 3px;
  --radius-r-md: 4px;
  --radius-r-lg: 6px;
  --radius-r-pill: 9px;

After this change, run `npm run build` to verify no errors. Then update the existing UI components that currently use `bg-[var(--taupe-3)]` syntax — search for `[var(--taupe-` and `[var(--violet-` and `[var(--berry-` and `[var(--white)]` and `[var(--off-white)]` and `[var(--green)]` and `[var(--red)]` and `[var(--amber)]` and `[var(--surface-` across all files in `app/components/ui/` and replace with the shorter form:
  `bg-[var(--taupe-3)]` → `bg-taupe-3`
  `text-[var(--taupe-5)]` → `text-taupe-5`
  `border-[var(--taupe-2)]` → `border-taupe-2`
  `bg-[var(--white)]` → `bg-white`
  `bg-[var(--off-white)]` → `bg-off-white`
  `bg-[var(--green)]` → `bg-green`
  `bg-[var(--red)]` → `bg-red`
  `bg-[var(--violet-3)]` → `bg-violet-3`
  `bg-[var(--surface-2)]` → `bg-surface-2`
  etc.

Leave `[var(--r-md)]` border-radius references alone for now — those use the `--r-*` tokens, and should become `rounded-r-md` after the theme registration.

The rendered output must not change.
```

---

## PHASE 1 — Shared Utility Classes

These are small, widely-reused classes. Port them first since they appear across many components.

---

### Prompt 1.1 — Port `.bevel` and `.bevel-inset`

```
The `.bevel` and `.bevel-inset` classes in `app.css` create a raised/inset 3D border effect using four-value border-color. Since Tailwind v4 supports individual border-side colors, we can inline these.

**Step 1:** Search all files in `app/components/` and `app/routes/` for `className` attributes containing the word `bevel` (but not `bevel-inset`). For each occurrence:
- If the element has `className="... bevel ..."`, replace the `bevel` class with: `border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2`
- If the element already has a `border` or `border-2` class, just add the border-color utilities without a duplicate `border` class.

**Step 2:** Search all files for `bevel-inset`. For each occurrence:
- Replace `bevel-inset` with: `border border-solid border-t-taupe-3 border-l-taupe-3 border-b-taupe-1 border-r-taupe-1 dark:border-taupe-2`

**Step 3:** Delete the `.bevel` and `.bevel-inset` CSS rules (and their `.dark` variants) from `app.css`.

IMPORTANT: Some elements use `bevel` alongside `border-2` for a thicker bevel — preserve the `border-2` width and only replace the class name with border-color utilities.

The rendered output must not change.
```

---

### Prompt 1.2 — Port `.label-mono`

```
The `.label-mono` class in `app.css` is:
  font-family: var(--mono); font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--taupe-3);

Search all files in `app/components/` and `app/routes/` for `label-mono` in className attributes. For each occurrence, replace the `label-mono` class with these Tailwind utilities:
  `font-mono text-[0.625rem] uppercase tracking-[0.05em] text-taupe-3`

Then delete the `.label-mono` rule from `app.css`.

The rendered output must not change.
```

---

### Prompt 1.3 — Port `.detail-section` family

```
The `.detail-section` family creates beveled section panels. The CSS rules are:

.detail-section { background: var(--white); border: 2px solid; border-color: var(--taupe-2) var(--taupe-3) var(--taupe-3) var(--taupe-2); margin-bottom: 12px; border-radius: var(--r-md); }
.detail-section-bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--taupe-5); border-bottom: 1px solid var(--taupe-4); }
.detail-section-title { font-family: var(--mono); font-size: 0.6875rem; font-weight: 600; color: var(--taupe-1); text-transform: uppercase; letter-spacing: 0.1em; }
.detail-section-body { padding: 14px; }

IMPORTANT: Check if there is a `SectionPanel` component in `app/components/ui/section-panel.tsx` that already wraps this pattern. If so, the Tailwind utilities should go INTO that component's JSX, and you should delete the CSS classes it references. If SectionPanel doesn't exist, inline the Tailwind utilities directly at each usage site.

For `.detail-section`, replace with:
  `bg-white border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 mb-3 rounded-r-md dark:bg-surface-1 dark:border-taupe-2`

For `.detail-section-bar`, replace with:
  `flex items-center gap-2 px-3 py-2 bg-taupe-5 border-b border-taupe-4`

For `.detail-section-title`, replace with:
  `font-mono text-[0.6875rem] font-semibold text-taupe-1 uppercase tracking-[0.1em]`

For `.detail-section-body`, replace with:
  `p-[14px]`

Then delete all `.detail-section*` rules from `app.css`.

The rendered output must not change.
```

---

### Prompt 1.4 — Port `.kv-row`, `.kv-key`, `.kv-val`

```
The KV row pattern shows key-value data pairs. The CSS rules are:

.kv-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--taupe-1); }
.kv-row:last-child { border-bottom: none; }
.kv-key { font-family: var(--mono); font-size: 0.6875rem; color: var(--taupe-3); text-transform: uppercase; letter-spacing: 0.08em; }
.kv-val { font-family: var(--mono); font-size: 0.75rem; font-weight: 600; color: var(--taupe-5); }

IMPORTANT: Check if there is a `KvRow` component in `app/components/ui/kv-row.tsx`. If so, port the Tailwind into that component's JSX.

For `.kv-row`, replace with:
  `flex justify-between py-1.5 border-b border-taupe-1 last:border-b-0`

For `.kv-key`, replace with:
  `font-mono text-[0.6875rem] text-taupe-3 uppercase tracking-[0.08em]`

For `.kv-val`, replace with:
  `font-mono text-xs font-semibold text-taupe-5`

Then delete all `.kv-*` rules from `app.css`.

The rendered output must not change.
```

---

## PHASE 2 — Memory / Brain Components

These are the brain section classes. Work file-by-file.

---

### Prompt 2.1 — Port memory-fact.tsx CSS classes

```
In `app/components/brain/memory-fact.tsx`, port all custom CSS classes to Tailwind utilities and delete the corresponding rules from `app.css`.

Classes to port (replace each className string with Tailwind utilities):

1. `.mem-fact-card` → `bg-white border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 border-l-[3px] border-l-taupe-2 rounded-r-md px-[14px] py-[10px] transition-colors duration-150 hover:border-taupe-3 hover:border-r-taupe-4 hover:border-b-taupe-4 dark:bg-surface-1 dark:border-taupe-3 dark:hover:border-taupe-4`

   The element also has `data-category` attribute used for left-border color accents. Keep these 6 CSS rules in `app.css` since `data-*` attribute selectors can't be expressed as Tailwind:
   `.mem-fact-card[data-category="preference"] { border-left-color: var(--berry-3); }`
   (and the other 5 categories)
   OR convert them to inline styles using a lookup in the component.

   PREFERRED: Convert to inline style. In the component, create a `const CATEGORY_BORDER_COLOR` map:
   ```
   const CATEGORY_BORDER_COLOR: Record<string, string> = {
     preference: 'var(--berry-3)',
     workflow: 'var(--green)',
     contact: 'var(--blue-3)',
     fund: 'var(--violet-3)',
     style: 'var(--amber)',
     context: 'var(--taupe-3)',
   };
   ```
   Then on the `mem-fact-card` div, add `style={{ borderLeftColor: CATEGORY_BORDER_COLOR[fact.category] }}` and remove the `data-category` attribute.

2. `.mem-fact-text` → `font-mono text-xs leading-relaxed text-taupe-5 mb-1.5`

3. `.mem-fact-date` and `.mem-fact-source` → `font-mono text-[0.625rem] text-taupe-2`

4. `.mem-entity-chip` → `inline-flex items-center gap-1 px-[7px] py-[2px] pl-[5px] font-mono text-[0.625rem] text-taupe-4 bg-off-white border border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-r-pill cursor-pointer transition-all duration-100 hover:bg-violet-1 hover:border-violet-2 hover:border-r-violet-3 hover:border-b-violet-3 hover:text-violet-4 active:bg-violet-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 dark:bg-[rgba(0,0,0,0.15)] dark:border-taupe-3 dark:text-taupe-3 dark:hover:bg-[rgba(var(--violet-3-rgb),0.15)] dark:hover:text-violet-2`

5. `.mem-fact-menu-btn` — the element already has some Tailwind classes. Replace the `mem-fact-menu-btn` class. The card's parent div needs a `group` class added. Then the menu button gets: `bg-transparent border-none text-taupe-2 cursor-pointer px-1 py-0.5 transition-colors duration-100 opacity-0 group-hover:opacity-100 group-hover:text-taupe-3 hover:text-taupe-5 focus-visible:opacity-100`

After porting, delete all `.mem-fact-card`, `.mem-fact-text`, `.mem-fact-date`, `.mem-fact-source`, `.mem-entity-chip`, `.mem-fact-menu-btn` rules from `app.css` (including dark variants and hover/focus states). Keep the `data-category` border rules ONLY if you did NOT convert to inline styles.

The rendered output must not change.
```

---

### Prompt 2.2 — Port memory-list.tsx CSS classes

```
In `app/components/brain/memory-list.tsx`, port all custom CSS classes to Tailwind.

Classes to port:

1. `.mem-cat-pill` → `font-mono text-[0.6875rem] font-semibold px-[10px] py-[3px] border border-taupe-2 rounded-r-md bg-off-white text-taupe-3 cursor-pointer transition-all duration-100 tracking-[0.03em] hover:border-violet-2 hover:text-violet-3 dark:bg-surface-2 dark:border-taupe-3 dark:text-taupe-3 dark:hover:border-violet-2 dark:hover:text-violet-2`

   For the `.active` state, conditionally add: `bg-violet-3 text-white border-t-violet-2 border-l-violet-2 border-b-violet-4 border-r-violet-4 dark:bg-violet-3 dark:border-violet-2 dark:text-white` and remove the inactive color/bg classes.

   The component likely uses a conditional expression or `cn()` to toggle active state. Preserve that pattern but with Tailwind classes instead of the `active` CSS class.

2. `.mem-search-input` → `w-full pl-[30px] pr-[10px] py-[7px] font-mono text-xs text-taupe-5 bg-off-white border-2 border-t-taupe-3 border-l-taupe-3 border-b-taupe-1 border-r-taupe-1 focus:border-violet-3 dark:bg-surface-2 dark:border-surface-0 dark:border-r-surface-3 dark:border-b-surface-3 dark:focus:border-violet-3`

3. `.mem-section-label` → `font-mono text-[0.625rem] uppercase text-taupe-3`

4. `.mem-no-results` and children — replace with Tailwind utilities. If the `EmptyState` component is being used instead, these may already be unused. Check before porting.

5. `.mem-role-card` → `bg-off-white border-2 border-taupe-2 p-3 rounded-r-md`

6. `.mem-role-text` → `font-mono text-[0.7rem] text-taupe-3 uppercase`

After porting, delete all `.mem-cat-pill`, `.mem-search-input`, `.mem-section-label`, `.mem-no-results`, `.mem-role-card`, `.mem-role-text` rules from `app.css` (including `.active`, `.dark`, and `:hover` variants).

The rendered output must not change.
```

---

### Prompt 2.3 — Port trait-badges.tsx CSS classes

```
In `app/components/brain/trait-badges.tsx`, port all custom CSS classes to Tailwind.

1. `.mem-trait-tag` → `font-mono text-[0.6875rem] font-semibold px-[10px] py-1 border border-taupe-2 rounded-r-md bg-off-white text-taupe-4 cursor-pointer transition-all duration-100 tracking-[0.02em] select-none hover:border-berry-2 hover:text-berry-3 dark:bg-surface-2 dark:border-taupe-3 dark:text-taupe-3 dark:hover:border-berry-2 dark:hover:text-berry-2`

   For `.active` state: `bg-berry-3 text-white border-t-berry-2 border-l-berry-2 border-b-berry-5 border-r-berry-5 hover:bg-berry-4 dark:text-white`
   For `.disabled` state: `opacity-35 cursor-default hover:border-taupe-2 hover:text-taupe-4`

2. `.mem-trait-input` → `px-2 py-1.5 border border-taupe-2 rounded-r-sm text-sm`

3. `.mem-trait-add-btn` → `px-3 py-2 bg-violet-3 text-white rounded-r-sm cursor-pointer border border-violet-4`

4. `.mem-trait-presets` → `grid grid-cols-2 gap-2`

5. `.mem-trait-custom` → `flex gap-2 mt-2`

6. `.trait-x` → `text-taupe-3 cursor-pointer`

After porting, delete all `.mem-trait-*` and `.trait-x` rules from `app.css`.

The rendered output must not change.
```

---

### Prompt 2.4 — Port `.cat-*` category badge classes

```
The `.cat-*` classes provide colored backgrounds/borders for memory category badges. They are referenced via the `MEMORY_CATEGORY_CSS` constant in `app/lib/brain-constants.ts`.

**Strategy:** Instead of keeping CSS classes, convert to a Tailwind class map.

In `app/lib/brain-constants.ts`, replace the `MEMORY_CATEGORY_CSS` constant with a new `MEMORY_CATEGORY_STYLES` that maps to Tailwind classes:

```typescript
export const MEMORY_CATEGORY_STYLES: Record<string, string> = {
  preference: 'bg-berry-1 text-berry-4 border border-berry-2 dark:bg-[rgba(var(--berry-3-rgb),0.12)] dark:border-[rgba(var(--berry-3-rgb),0.2)]',
  workflow: 'bg-[rgba(var(--green-rgb),0.1)] text-green border border-[rgba(var(--green-rgb),0.25)] dark:bg-[rgba(var(--green-rgb),0.12)]',
  contact: 'bg-blue-1 text-blue-3 border border-blue-2 dark:bg-[rgba(var(--blue-3-rgb),0.12)] dark:border-[rgba(var(--blue-3-rgb),0.2)]',
  fund: 'bg-violet-1 text-violet-3 border border-violet-2 dark:bg-[rgba(var(--violet-3-rgb),0.12)] dark:border-[rgba(var(--violet-3-rgb),0.2)]',
  style: 'bg-[rgba(var(--amber-rgb),0.1)] text-amber border border-[rgba(var(--amber-rgb),0.25)] dark:bg-[rgba(var(--amber-rgb),0.12)]',
  context: 'bg-taupe-1 text-taupe-4 border border-taupe-2 dark:bg-surface-2 dark:border-taupe-3',
};
```

Then update `app/components/brain/memory-fact.tsx` to import `MEMORY_CATEGORY_STYLES` instead of `MEMORY_CATEGORY_CSS`, and use it with `cn()`:
  Where it currently has `MEMORY_CATEGORY_CSS[fact.category] || 'cat-context'`
  Change to `MEMORY_CATEGORY_STYLES[fact.category] || MEMORY_CATEGORY_STYLES.context`

Search for any other files that import `MEMORY_CATEGORY_CSS` and update them similarly.

Then delete all `.cat-preference`, `.cat-workflow`, `.cat-contact`, `.cat-fund`, `.cat-style`, `.cat-context` rules (including `.dark` variants) from `app.css`.

The rendered output must not change.
```

---

### Prompt 2.5 — Port `.brain-scope-badge` and scope classes

```
The `.brain-scope-badge` with `.scope-user` / `.scope-company` modifiers creates colored scope badges. These are referenced via `SCOPE_CONFIG` in `app/lib/brain-constants.ts`.

**Strategy:** Convert CSS classes to Tailwind class strings in the constant.

In `app/lib/brain-constants.ts`, replace `SCOPE_CONFIG`:

```typescript
export const SCOPE_CONFIG: Record<string, { label: string; className: string }> = {
  user: {
    label: 'Personal',
    className: 'font-mono text-[0.625rem] font-bold px-[7px] py-[2px] rounded-r-md uppercase tracking-[0.06em] bg-violet-3 text-white border border-violet-3',
  },
  company: {
    label: 'Company',
    className: 'font-mono text-[0.625rem] font-bold px-[7px] py-[2px] rounded-r-md uppercase tracking-[0.06em] bg-blue-3 text-white border border-blue-3',
  },
};
```

Then update all files that use `brain-scope-badge` and `scope-user`/`scope-company` classes:
- Search for `brain-scope-badge` in all files under `app/components/` and `app/routes/`.
- Check `app/components/ui/scope-badge.tsx` — this likely uses `SCOPE_CONFIG`. Update it to use `SCOPE_CONFIG[scope].className` instead of the CSS classes.
- Remove the `brain-scope-badge`, `scope-user`, `scope-company` classes from the className attributes. Replace with the Tailwind classes from `SCOPE_CONFIG[scope].className`.

Then delete `.brain-scope-badge`, `.scope-user`, `.scope-company` rules (including `.dark` variants) from `app.css`.

The rendered output must not change.
```

---

### Prompt 2.6 — Port lesson-card.tsx and lesson-detail.tsx CSS classes

```
Port all custom CSS classes in brain/lesson components to Tailwind.

**In `app/components/brain/lesson-card.tsx`:**

1. `.brain-lesson-card` → `bg-white border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 border-l-[3px] border-l-violet-3 rounded-r-md px-[14px] py-3 cursor-pointer transition-colors duration-150 hover:border-violet-3 hover:border-r-violet-4 hover:border-b-violet-4 hover:border-l-violet-4 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:bg-surface-1 dark:border-taupe-3 dark:border-l-violet-3 dark:hover:border-violet-3`

**In `app/components/brain/lesson-detail.tsx`:**

1. `.lesson-back-btn` → `inline-flex items-center gap-1.5 px-3 py-1.5 border border-taupe-2 rounded-r-sm cursor-pointer`

2. `.lesson-detail-meta` → `flex gap-4 p-3 border-b border-taupe-1`

3. `.lesson-detail-stat` → `flex flex-col gap-1`

4. `.lesson-block` → `mb-4 p-3 border border-taupe-1 rounded-r-md bg-off-white`

5. `.lesson-table` → `w-full border-collapse my-3`

After porting, delete all `.brain-lesson-card`, `.lesson-back-btn`, `.lesson-detail-meta`, `.lesson-detail-stat`, `.lesson-block`, `.lesson-table` rules from `app.css`.

The rendered output must not change.
```

---

### Prompt 2.7 — Port entity-detail.tsx and entity-graph.tsx CSS classes

```
Port graph-related CSS classes to Tailwind.

**In `app/components/brain/entity-detail.tsx`:**

1. `.graph-detail-pane` → `absolute right-0 top-0 bottom-0 w-[300px] bg-off-white border-l border-taupe-2 translate-x-full transition-transform duration-300`
   For `.open` state: `translate-x-0`

2. `.graph-detail-header` → `p-3 border-b border-taupe-1`

3. `.graph-detail-title-row` → `flex items-center gap-2 mb-2`

4. `.graph-detail-icon` → `size-6 flex items-center justify-center bg-taupe-1 rounded-r-sm`

5. `.graph-detail-name` → `font-semibold text-taupe-5`

6. `.graph-detail-type` → `font-mono text-[0.625rem] text-taupe-3 uppercase`

7. `.graph-detail-body` → `p-3 overflow-y-auto max-h-[calc(100%-60px)]`

8. `.graph-detail-facts` → `flex flex-col gap-2`

9. `.graph-fact-row` → `flex gap-2 p-2 bg-white rounded-r-sm border border-taupe-1`

10. `.graph-fact-bullet` → `shrink-0 size-1 bg-violet-3 rounded-full mt-1.5`

11. `.graph-fact-text` → `flex-1 text-sm text-taupe-4`

12. `.graph-detail-related-label` → `font-mono text-[0.625rem] text-taupe-3 uppercase mt-3 mb-1.5`

13. `.graph-detail-related` → `flex flex-col gap-1`

14. `.graph-related-pill` → `inline-flex px-2 py-1 bg-taupe-1 border border-taupe-2 rounded-r-sm text-taupe-4 text-xs cursor-pointer`

**In `app/components/brain/entity-graph.tsx`:**

1. `.graph-container` → `relative flex-1 h-full w-full overflow-hidden`

2. `.graph-svg` → `w-full h-full` (keep the dynamic `cursor-grab`/`cursor-grabbing` that's already set via `cn()`)

3. `.graph-legend` → Port to Tailwind (check actual CSS for positioning — likely absolute positioned overlay)

4. `.graph-legend-item`, `.graph-legend-dot`, `.graph-legend-label`, `.graph-legend-count` → Port each to Tailwind

5. `.graph-zoom-controls`, `.graph-zoom-btn` → Port to Tailwind

**In `app/components/brain/graph-breadcrumb.tsx`:**

1. `.graph-breadcrumb` → `flex gap-1 items-center p-2 text-xs`

2. `.graph-crumb` → `cursor-pointer text-violet-3 no-underline`
   `.graph-crumb.active` → `text-taupe-5 cursor-default`

3. `.graph-crumb-sep` → `text-taupe-2`

After porting, delete all `graph-*` CSS rules from `app.css`. Be careful to only delete the graph component rules, NOT any graph-related `@keyframes` animations.

The rendered output must not change.
```

---

## PHASE 3 — Header / Layout Components

---

### Prompt 3.1 — Port app-header.tsx CSS classes

```
In `app/components/layout/app-header.tsx`, port all custom CSS classes to Tailwind. This is the highest-usage file (41 custom class references).

Port these classes (check `app.css` for exact CSS and dark mode variants of each):

1. `.top-tab-bar` → Check CSS. Likely: `flex items-center gap-0 bg-white border-b border-taupe-1 dark:bg-surface-1 dark:border-taupe-2` (verify exact properties)

2. `.top-tab` → Likely includes font, padding, border, color, hover, active states with `::before` pseudo-element. The `::before` pseudo-element CANNOT be expressed as Tailwind — create a minimal CSS rule using `@apply` or keep as a focused CSS rule:
   ```css
   .top-tab.active::before { /* keep this rule */ }
   ```
   Port all OTHER properties to Tailwind.

3. `.top-tab-icon` → Port to Tailwind

4. `.top-icon-btn` → Port to Tailwind including `:hover`, `:focus-visible`, and `.dark` variants

5. `.top-profile`, `.top-profile-avatar`, `.top-profile-name` → Port to Tailwind

6. `.th-divider` → Port to Tailwind

7. `.th-icon` → Port to Tailwind

8. `.th-dropdown-panel`, `.th-dropdown-header`, `.th-dropdown-footer` → Port to Tailwind

9. `.header-btn` and `.header-btn.icon-btn` — these may now be handled by the Button component from Tier 3 extraction. If the Button component is used, remove the CSS. If raw `<button className="header-btn ...">` still exists, port to Tailwind.

For any class with a `::before` or `::after` pseudo-element, keep that specific rule in `app.css` and only port the non-pseudo properties to Tailwind.

After porting, delete all ported rules from `app.css`. Keep any `::before`/`::after` rules that couldn't be fully inlined.

The rendered output must not change.
```

---

### Prompt 3.2 — Port `.app-frame` and sidebar CSS classes

```
In `app/routes/_app.tsx` (or wherever `.app-frame` is used) and `app/components/layout/app-sidebar.tsx`:

1. `.app-frame` → `flex w-screen h-screen p-1 overflow-hidden bg-taupe-4`

   The `.app-frame` also has child selectors using `[data-slot="..."]` attribute selectors with `!important` overrides for shadcn sidebar slots. These CANNOT be ported to Tailwind because:
   - They use attribute selectors (`[data-slot="sidebar-wrapper"]`)
   - They use `!important` to override shadcn defaults

   **Keep these child-selector rules in `app.css`** but port the simple `.app-frame` properties.

2. `.sidebar-search-input` → `w-full px-[10px] py-[8px] font-mono text-xs text-taupe-5 bg-transparent border border-taupe-2 rounded-r-sm placeholder:text-taupe-3 focus:border-violet-3 focus:outline-none dark:border-taupe-2 dark:text-taupe-3 dark:focus:border-violet-3`

3. `.sidebar-new-btn` → Check CSS and port. Likely includes padding, bg, color, border, rounded, hover, active, focus-visible states.

4. `.sidebar-section-label` → Port to Tailwind (mono font, uppercase, small text, taupe color)

5. `.sidebar-narrow` responsive variants — these use descendant selectors and CANNOT be expressed as Tailwind. Keep in `app.css`.

After porting the portable rules, delete them from `app.css`. Keep attribute-selector rules and `.sidebar-narrow` descendant rules.

The rendered output must not change.
```

---

## PHASE 4 — Chat Components

---

### Prompt 4.1 — Port message-block.tsx CSS classes

```
In `app/components/chat/message-block.tsx`, port all custom CSS classes to Tailwind.

Check `app.css` for the exact CSS of each class (including dark variants) and port:

1. `.msg-row` → Port layout properties (flex, gap, padding, etc.)
2. `.msg-bubble` → Port background, border, border-radius, padding, etc.
3. `.msg-avatar` → Port size, border-radius, background
4. All other `msg-*` classes in this file → Port each to Tailwind
5. `.file-attachment`, `.file-attachment-icon`, `.file-attachment-info`, `.file-attachment-name`, `.file-attachment-meta`, `.file-attachment-action` → Port to Tailwind
6. `.file-chip` → Port to Tailwind
7. `.code-block`, `.code-block-header`, `.code-block-lang`, `.code-block-copy` → Port to Tailwind
8. `.cite-ref` → Port to Tailwind

For each class, look up its EXACT CSS in `app.css` (including `.dark` and `:hover` variants) before writing the Tailwind translation. Do not guess.

After porting, delete the ported rules from `app.css`.

The rendered output must not change.
```

---

### Prompt 4.2 — Port chat-input.tsx, chat-header.tsx CSS classes

```
Port all custom CSS classes in chat input and header components.

**In `app/components/chat/chat-input.tsx`:**
1. `.attach-dropdown`, `.attach-option` → Port to Tailwind
2. `.wf-command-autocomplete`, `.wf-ac-item`, `.wf-ac-cmd`, `.wf-ac-desc` → Port to Tailwind
3. `.wf-command-chip`, `.wf-command-inline` → Port to Tailwind
4. Any other custom classes → Port to Tailwind

**In `app/components/chat/chat-header.tsx`:**
1. Any remaining `header-btn` or custom classes → Port to Tailwind

**In `app/components/chat/thread-list.tsx`:**
1. `.date-separator`, `.date-separator-line`, `.date-separator-label` → Port to Tailwind

For each class, look up its EXACT CSS in `app.css` before writing the Tailwind translation.

After porting, delete the ported rules from `app.css`.

The rendered output must not change.
```

---

### Prompt 4.3 — Port file-panel.tsx and artifact.tsx CSS classes

```
Port all custom CSS classes in file panel and artifact components.

**In `app/components/chat/file-panel.tsx`:**
1. `.file-panel`, `.file-panel-header`, `.file-panel-tab`, `.file-panel-close` → Port to Tailwind
2. All `fp-*` classes used in this file → Port to Tailwind

**In `app/components/chat/artifact.tsx`:**
1. `.artifact`, `.art-body`, `.art-bar`, `.art-title`, `.art-toggle`, `.art-close`, `.art-stripe`, `.art-live` → Port to Tailwind

For each class, look up its EXACT CSS in `app.css` (including `.dark` and `:hover` variants) before writing the Tailwind translation.

After porting, delete the ported rules from `app.css`.

The rendered output must not change.
```

---

### Prompt 4.4 — Port chat layout and empty state CSS classes

```
Port remaining chat CSS classes.

**In `app/routes/_app.chat.tsx`:**
1. `.empty-thread`, `.empty-thread-icon`, `.empty-thread-title`, `.empty-thread-sub`, `.empty-thread-suggestions`, `.empty-thread-chip` → Port to Tailwind

**In `app/routes/_app.chat.$threadId.tsx` (or wherever `.chat-main`, `.chat-scroll`, `.chat-with-panel` are used):**
1. `.chat-main` → Port to Tailwind
2. `.chat-scroll` → Port to Tailwind
3. `.chat-with-panel` → Port to Tailwind

For each class, look up its EXACT CSS in `app.css` before writing the Tailwind translation.

After porting, delete the ported rules from `app.css`.

The rendered output must not change.
```

---

## PHASE 5 — Workflow Components

---

### Prompt 5.1 — Port workflow-card.tsx CSS classes

```
In `app/components/workflows/workflow-card.tsx`, port all custom CSS classes to Tailwind.

1. `.wf-card` → `bg-white border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 mb-2 cursor-pointer transition-colors duration-150 rounded-r-md hover:border-violet-2 hover:border-r-violet-4 hover:border-b-violet-4 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:bg-surface-1 dark:border-taupe-2 dark:hover:border-violet-2`
   Add `group` class for any parent-hover child patterns.

2. `.wf-card-header` → `flex items-center justify-between px-[14px] py-[10px] border-b border-taupe-1 bg-[rgba(0,0,0,0.01)] dark:bg-[rgba(255,255,255,0.02)] dark:border-taupe-2`

3. `.wf-card-header-left` → `flex items-center gap-2 flex-1 min-w-0`

4. `.wf-card-title` → `font-mono text-[0.8125rem] font-semibold text-taupe-5`

5. `.wf-card-status` → `text-xs font-semibold px-2 py-[3px] border rounded-r-sm whitespace-nowrap`
   Status variants (apply conditionally):
   - `.status-active` → `text-green border-green bg-[rgba(var(--green-rgb),0.08)] dark:bg-[rgba(var(--green-rgb),0.12)]`
   - `.status-draft` → `text-amber border-amber bg-[rgba(var(--amber-rgb),0.08)] dark:bg-[rgba(var(--amber-rgb),0.12)]`
   - `.status-paused` → `text-taupe-3 border-taupe-3 bg-[rgba(var(--taupe-3-rgb),0.08)] dark:bg-[rgba(var(--taupe-3-rgb),0.12)]`
   - `.status-archived` → `text-taupe-3 border-taupe-2 bg-[rgba(var(--taupe-3-rgb),0.06)]`

6. `.wf-card-trigger-chip` → `inline-flex items-center gap-1 font-mono text-[0.625rem] font-semibold text-taupe-3 bg-[rgba(var(--taupe-3-rgb),0.08)] px-2 py-[2px] rounded-r-sm whitespace-nowrap dark:bg-[rgba(var(--taupe-3-rgb),0.12)]`

7. `.wf-card-body` → `px-[14px] py-[10px] flex gap-6`

8. `.wf-card-desc` → `flex-1 text-[0.8125rem] text-taupe-4 leading-relaxed dark:text-taupe-3`

9. `.wf-card-meta` → `flex gap-4 items-center shrink-0`

10. `.wf-card-footer` → `flex items-center gap-2.5 px-[14px] py-1.5 border-t border-taupe-1 dark:border-taupe-2`

11. `.wf-card-run-btn` and `.wf-card-run-status` → Port to Tailwind (check CSS for exact properties)

12. `.wf-card-lesson-chip` → Port to Tailwind

After porting, delete all `.wf-card*` and `.status-*` rules from `app.css`.

The rendered output must not change.
```

---

### Prompt 5.2 — Port template-detail.tsx and tabs CSS classes

```
In `app/components/workflows/template-detail.tsx` and related tab components, port all custom CSS classes.

**In template-detail.tsx:**
1. `.wf-detail` → `flex-1 flex flex-col overflow-hidden`
2. `.wf-detail-header` → `px-5 pt-[14px] bg-white` (check CSS for exact values)
3. `.wf-detail-top` → `flex items-center gap-3 mb-3`
4. `.wf-detail-name` → `font-pixel text-[1.375rem] text-taupe-5 tracking-[0.5px]`
5. `.wf-detail-meta` → Port to Tailwind
6. `.wf-detail-meta-badge`, `.wf-detail-meta-badge-muted`, `.wf-detail-meta-chip`, `.wf-detail-meta-sep`, `.wf-detail-meta-text` → Port each
7. `.wf-detail-desc` → Port to Tailwind
8. `.wf-detail-columns`, `.wf-detail-graph-col`, `.wf-detail-info-col` → Port to Tailwind
9. `.wf-detail-actions-btn`, `.wf-detail-run-btn` → Port to Tailwind
10. `.back-btn` → Port to Tailwind

**In `app/components/workflows/overview-tab.tsx`:**
- Any remaining `detail-section` or `kv-row` classes should already be handled from Phase 1 prompts

**In `app/components/workflows/schema-tab.tsx`:**
1. `.schema-*` classes → Port to Tailwind

**In `app/components/workflows/runs-tab.tsx`:**
1. `.run-row`, `.run-status-dot` and related classes → Port to Tailwind (some may be in the `RunRow` component)

**In `app/components/workflows/lessons-tab.tsx`:**
1. Any remaining custom classes → Port to Tailwind

For each class, look up its EXACT CSS in `app.css` before writing the Tailwind translation.

After porting, delete all ported rules from `app.css`.

The rendered output must not change.
```

---

### Prompt 5.3 — Port workflow-stats.tsx CSS classes

```
In `app/components/workflows/workflow-stats.tsx`, port all custom CSS classes.

1. `.wf-stats-section` → Check CSS. Likely a variant of `detail-section`. Port to Tailwind.
2. `.wf-stats-section-bar` → Port to Tailwind (variant of `detail-section-bar`)
3. `.wf-stats-body` → Port to Tailwind
4. `.wf-stats-sep` → Port to Tailwind
5. `.wf-stat-inline`, `.wf-stat-inline-label`, `.wf-stat-inline-val` → Port to Tailwind
6. `.wf-run-dot` → Port to Tailwind
7. `.wf-run-summary`, `.wf-run-summary-row`, `.wf-run-summary-label`, `.wf-run-summary-value` → Port to Tailwind
8. `.wf-status-chip`, `.wf-status-completed`, `.wf-status-running` → Port to Tailwind
9. `.usage-*` classes if present → Port to Tailwind

For each class, look up its EXACT CSS in `app.css` before writing.

After porting, delete all ported rules from `app.css`.

The rendered output must not change.
```

---

### Prompt 5.4 — Port workflow-panel.tsx (chat side panel) CSS classes

```
In `app/components/chat/workflow-panel.tsx`, port all custom CSS classes. This file has 32 custom class references.

1. `.workflow-panel` → Port to Tailwind
2. `.workflow-panel-header`, `.workflow-panel-title-row`, `.workflow-panel-name`, `.workflow-panel-run-id`, `.workflow-panel-status`, `.workflow-panel-header-right` → Port each
3. `.workflow-panel-close` → Port to Tailwind
4. `.workflow-panel-details` → Port to Tailwind
5. `.workflow-panel-section`, `.workflow-panel-section-label`, `.workflow-panel-section-body` → Port each
6. `.workflow-panel-graph` → Port to Tailwind
7. `.wf-panel-exception`, `.wf-panel-exception-dot`, `.wf-panel-exception-type`, `.wf-panel-exception-desc`, `.wf-panel-exception-body`, `.wf-panel-exception-confidence` → Port each
8. `.wf-panel-file-item`, `.wf-panel-file-icon`, `.wf-panel-file-name`, `.wf-panel-file-meta` → Port each
9. `.wf-panel-empty` → Port to Tailwind

For each class, look up its EXACT CSS in `app.css` before writing.

After porting, delete all `.workflow-panel*` and `.wf-panel-*` rules from `app.css`.

The rendered output must not change.
```

---

### Prompt 5.5 — Port flow-graph components CSS classes

```
In `app/components/workflows/flow-graph.tsx`, `flow-node.tsx`, and `flow-edge.tsx`, port all custom CSS classes.

1. `.flow-graph` → Port to Tailwind
2. `.flow-node` and all flow-node variants → Port to Tailwind
3. `.flow-edge` and variants → Port to Tailwind
4. Any `wf-artifact-graph` class → Port to Tailwind

Check for `@keyframes wf-pulse`, `wf-pulse-node` — these are animations that must STAY in `app.css`. Only port the class rules that reference these animations, using Tailwind's `animate-` prefix or inline the animation name.

For each class, look up its EXACT CSS in `app.css` before writing.

After porting, delete the ported class rules from `app.css`. Keep the `@keyframes` definitions.

The rendered output must not change.
```

---

## PHASE 6 — Remaining Components and Routes

---

### Prompt 6.1 — Port cosimo-panel.tsx (AI reasoning/thinking) CSS classes

```
In `app/components/layout/cosimo-panel.tsx` and `app/components/chat/message-stream.tsx`:

1. `.cosimo-reasoning`, `.cosimo-thinking` → Port to Tailwind
2. `.cosimo-typing-dot` → Port to Tailwind (may reference an animation — keep `@keyframes` in CSS)
3. `.cosimo-error`, `.cosimo-error-icon`, `.cosimo-error-title`, `.cosimo-error-content`, `.cosimo-error-detail`, `.cosimo-error-meta`, `.cosimo-error-retry` → Port each
4. `.error-state` and children (if used) → Port to Tailwind

For animation classes, use the Tailwind `animate-[name]` arbitrary value syntax or a class like `animate-typing-bounce` if the animation name matches.

For each class, look up its EXACT CSS in `app.css` before writing.

After porting, delete the ported rules from `app.css`. Keep `@keyframes` definitions.

The rendered output must not change.
```

---

### Prompt 6.2 — Port remaining route-level CSS classes

```
Search all files in `app/routes/` for any remaining custom CSS class references (not Tailwind utilities).

Likely remaining:
1. `.wf-listing`, `.wf-no-results` in `_app.workflows.tsx` → Port to Tailwind
2. `.config-row`, `.config-label`, `.config-value` if settings routes exist → Port to Tailwind
3. `.data-tbl` and children in `app/components/chat/data-table.tsx` → Port to Tailwind (or confirm the Table component is being used instead)
4. `.erabor-*` classes in message rendering → Port to Tailwind

For each class, look up its EXACT CSS in `app.css` before writing.

After porting, delete the ported rules from `app.css`.

The rendered output must not change.
```

---

### Prompt 6.3 — Port login.module.css

```
Check if `app/routes/login.tsx` still uses `login.module.css`. If so:

1. Read the CSS module file
2. Convert all class rules to Tailwind utilities inline in `login.tsx`
3. Remove the CSS module import from `login.tsx`
4. Delete `login.module.css`

If `login.module.css` no longer exists or is empty, skip this prompt.

The rendered output must not change.
```

---

## PHASE 7 — Final Cleanup

---

### Prompt 7.1 — Audit remaining app.css

```
Read `app/app.css` and identify every remaining component class rule (anything that is NOT a `:root` variable, `.dark` variable override, `@theme`, `@layer base`, `@keyframes`, `@import`, `@font-face`, `@custom-variant`, or high-contrast override).

For each remaining class:
1. Search the codebase to see if it's still referenced anywhere
2. If referenced: port it to Tailwind and delete the rule
3. If NOT referenced: delete the rule (it's dead CSS)

After this, `app.css` should contain ONLY:
- `@import` statements
- `@font-face` declarations
- `@custom-variant dark`
- `@theme` / `@theme inline` blocks
- `:root` and `.dark` variable definitions
- High-contrast overrides
- `@layer base` reset
- Scrollbar styling
- `@keyframes` animations
- A handful of rules that genuinely need CSS (attribute selectors, `::before`/`::after` pseudo-elements, complex descendant selectors)

List all remaining non-variable/non-keyframe rules in a comment at the bottom of `app.css` with the reason each one was kept.

The rendered output must not change.
```

---

### Prompt 7.2 — Clean up animation references

```
Search `app.css` for all `@keyframes` definitions. For each one:
1. Search the codebase for references to that animation name (via className or CSS `animation:` property)
2. If the animation is NOT referenced anywhere, delete it
3. If it IS referenced via a CSS class that has been ported to Tailwind, ensure the Tailwind component uses `animate-[animation-name]` arbitrary value syntax

List the animations that remain and confirm each is still in use.
```

---

## Post-Completion Checklist

After all prompts are done, verify:
- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] All pages render identically to before (spot-check each main route)
- [ ] `app.css` contains only variables, themes, keyframes, base layer, and documented exceptions
- [ ] No unused CSS class rules remain in `app.css`
- [ ] No `className` attributes reference CSS classes that no longer exist
- [ ] Dark mode still works correctly on all pages
- [ ] Hover and focus states work on interactive elements
