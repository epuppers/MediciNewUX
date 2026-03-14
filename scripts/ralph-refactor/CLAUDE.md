# Ralph — React Migration Agent Instructions

You are one iteration of an autonomous coding loop. You have a FRESH context — no memory of previous iterations. Your knowledge comes from: the codebase on disk, prd.json, progress.txt, and CLAUDE.md files.

## Your Workflow (follow this exactly)

1. **Read the project CLAUDE.md** at the project root (`/CLAUDE.md`) — it contains the full architecture, design system, data models, mock conversation scripts, and code conventions for the ORIGINAL prototype. This is your reference implementation.

2. **Read REFACTORING-PLAN.md** at the project root — it contains the complete React migration plan with stack decisions, phase details, code examples, component mapping, and verification checklist. This is your blueprint.

3. **Read prd.json** (in `scripts/ralph-refactor/`) — find the first user story where `"passes": false`. That is your ONE task.

4. **Read progress.txt** (in `scripts/ralph-refactor/`) — check the Codebase Patterns section first, then review recent iteration notes for context on what's been done, file locations, and gotchas.

5. **Check you're on the correct branch** from prd.json `branchName`. If not, check it out or create it from main.

6. **Implement the ONE story.** Follow ALL rules below. Do not work on any other story.

7. **Verify your work** (see Verification section below).

8. **If all checks pass, commit:**

   ```bash
   git add -A
   git commit -m "refactor [TASK_ID]: [brief description]"
   ```

   Do NOT git push — human will push after reviewing.

9. **Update prd.json** — set `"passes": true` for the story you just completed.

10. **Update progress.txt** — append a section (see format below).

11. **Stop.** Do not continue to the next story.

## Critical Rules

- **ONE story per iteration.** Never combine tasks.
- **Do not output any completion signals.** The shell script checks prd.json directly.
- **If you can't complete the story** (blocked, unclear requirement, broken dependency), update progress.txt explaining WHY, leave the story's passes as false, and stop.
- **If the build breaks after your changes**, revert and try a different approach. Do not commit broken code.
- **Read the reference files first, every time.** You have no memory.

## Stack & Conventions

This is a React migration. The new codebase lives in `medici-app/` at the project root. The original vanilla prototype (index.html, js/, css/) remains untouched as reference.

### Tech Stack
- **React Router 7** (framework mode) — Vite-based, file routing, SSR-ready
- **Tailwind CSS v4** — CSS-first config, no tailwind.config.js
- **shadcn/ui** — Copy-paste components in components/ui/
- **Zustand** — Lightweight state management with persist middleware
- **Lucide React** — Icon library (replaces custom ICONS object)
- **TypeScript** — Full type coverage, no `any` types

### Project Structure (inside medici-app/)
```
app/
├── root.tsx                    — Root layout, theme provider
├── routes.ts                   — Route config
├── app.css                     — Tailwind imports + design tokens
├── a11y.css                    — Accessibility overrides
├── routes/                     — File-based routes
├── components/
│   ├── ui/                     — shadcn base components
│   ├── layout/                 — App shell (sidebar, header, cosimo, logo)
│   ├── chat/                   — Chat view components
│   ├── workflows/              — Workflow view components
│   └── brain/                  — Brain view components
├── lib/                        — Utilities (cn(), icons, color-utils)
├── services/                   — Data access layer (async functions)
├── data/                       — Mock data + config constants
├── stores/                     — Zustand stores
└── hooks/                      — Custom React hooks
```

### Code Rules
- **Components**: Functional components only. Props must be typed (interface or inline).
- **Imports**: Use `~/` alias for app-relative imports (e.g., `import { Button } from '~/components/ui/button'`).
- **State**: All shared state lives in Zustand stores. Component-local state uses useState/useReducer.
- **Data access**: Components NEVER import MOCK_* directly. They receive data via route loaders or service functions.
- **Events**: React event handlers on components. No document.addEventListener in components (only in hooks).
- **Styling**: Tailwind utilities + shadcn CSS variables. Custom CSS only for SVG graphs, logo animation, and a11y overrides.
- **Dark mode**: shadcn class-based (`.dark` on `<html>`). Use `dark:` Tailwind variant for custom dark mode styles.
- **No inline styles** except for dynamic values (purple intensity, panel width, font size).
- **No `any` types** — use proper TypeScript types everywhere.
- **JSDoc comments** on all exported functions and components.

### shadcn Component Usage
Always prefer shadcn components over custom UI:
- Buttons → `Button` from ui/button
- Cards → `Card`, `CardHeader`, `CardContent`, `CardFooter`
- Dropdowns → `DropdownMenu`
- Tables → `Table`, `TableRow`, `TableCell`
- Tabs → `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- Popovers → `Popover`, `PopoverTrigger`, `PopoverContent`
- Side panels → `Sheet`
- Toggles → `Switch`
- Sliders → `Slider`
- Loading states → `Skeleton`
- Error states → `Alert`
- Badges → `Badge`
- Command palette → `Command`

### Design Token Mapping
The existing tokens.css variables are mapped to shadcn CSS variables in app.css:
- `--off-white` → `--background`
- `--taupe-5` → `--foreground`
- `--violet-3` → `--primary`
- `--taupe-1` → `--secondary`
- `--taupe-3` → `--muted-foreground`
- `--red` → `--destructive`
- `--taupe-2` → `--border`
- Custom Medici tokens (--amber, --green, --blue, --berry, --violet-*) are preserved as CSS custom properties

### Node Color Scheme (for flow graph SVG)
| Type | Stroke Class | Fill Class |
|------|-------------|-----------|
| Input | stroke-blue-500 dark:stroke-blue-400 | fill-blue-50 dark:fill-blue-950 |
| Action | stroke-violet-500 dark:stroke-violet-400 | fill-violet-50 dark:fill-violet-950 |
| Gate | stroke-amber-500 dark:stroke-amber-400 (dashed) | fill-amber-50/10 dark:fill-amber-950/20 |
| Branch | stroke-muted-foreground | fill-background |
| Output | stroke-green-500 dark:stroke-green-400 | fill-green-50 dark:fill-green-950 |

### Run Status Colors (compact graph)
| Status | Color | Extra |
|--------|-------|-------|
| completed | green-500 | — |
| running | violet-500 | pulse animation |
| waiting | amber-500 | — |
| pending | muted-foreground/40 | opacity-40 |
| failed | red-500 | — |
| skipped | muted-foreground/40 | line-through on title |

## Verification Steps (do these EVERY iteration)

### For all stories:
```bash
cd medici-app
npx tsc --noEmit          # Must exit 0 — no type errors
npm run dev               # Must start without build errors
```

### For component/route stories, also:
1. Open http://localhost:5173 in a browser (or curl the dev server)
2. Navigate to the relevant route
3. Check the component renders correctly
4. Toggle dark mode — verify colors adapt
5. Check browser console for errors — must be zero

### For verification checkpoint stories (R-14, R-20, R-26, R-34, R-39, R-49, R-54, R-57):
These are dedicated QA tasks. Be EXTRA thorough:
1. Run all verification steps above
2. Test every feature mentioned in the story description
3. Test in both light and dark mode
4. Check for console errors
5. Fix ALL issues before marking the story as passed
6. Document what you fixed in progress.txt

### If verification fails:
1. Fix the issue
2. Re-run verification
3. If you can't fix it after 2 attempts, document the issue in progress.txt and leave the story as `passes: false`
4. The human will intervene

## Progress.txt Format

Append after each completed story:

```
## Iteration [N] — Task [ID]: [Title]
- What was done: [brief summary of implementation]
- Files created/modified: [list]
- Key decisions: [any architectural decisions made]
- Gotchas / learnings: [anything the next iteration should know]
- Verification: [what was checked and the result]
```

If you discover reusable patterns, add them to the **Codebase Patterns** section at the top of progress.txt.

## Reference Files Checklist

Before starting work, confirm you've read:
- [ ] `/CLAUDE.md` — Original prototype architecture
- [ ] `/REFACTORING-PLAN.md` — Migration plan with code examples
- [ ] `scripts/ralph-refactor/prd.json` — Task list
- [ ] `scripts/ralph-refactor/progress.txt` — Previous iteration notes

For data-related tasks, also read:
- [ ] `js/mock-data.js` — Original mock data (source of truth for data migration)
- [ ] `index.html` — Original HTML (source of truth for component structure and message content)

For styling tasks, also read:
- [ ] `css/tokens.css` — Design token definitions
- [ ] `css/layout.css`, `css/chat.css`, `css/components.css`, `css/workflows.css` — Original CSS

## Architecture Reminders

### Route → Loader → Component Pattern
Every route has a loader that calls the service layer. The component receives data via `loaderData`:
```tsx
export async function loader({ params }: Route.LoaderArgs) {
  const data = await getWhatever(params.id);
  if (!data) throw new Response('Not found', { status: 404 });
  return { data };
}

export default function MyRoute({ loaderData }: Route.ComponentProps) {
  const { data } = loaderData;
  return <MyComponent data={data} />;
}
```

### Store Usage Pattern
Zustand stores for cross-component state:
```tsx
const isOpen = useUIStore(s => s.cosimoPanelOpen);
const close = useUIStore(s => s.closeCosimoPanel);
```

### Navigation Pattern
React Router `<Link>` or `useNavigate()`:
```tsx
import { Link, useNavigate } from 'react-router';
const navigate = useNavigate();
navigate(`/chat/${threadId}`);
```

### Dark Mode Pattern
Tailwind dark: variant for custom styles. shadcn components auto-adapt:
```tsx
<div className="bg-background text-foreground border-border">
  {/* Uses CSS variables that change with .dark class */}
</div>
```

## What NOT to Do
- Do NOT modify the original prototype files (index.html, js/, css/)
- Do NOT install additional dependencies without documenting why
- Do NOT use `document.querySelector` in React components
- Do NOT import MOCK_* data directly in components
- Do NOT use inline event handlers on JSX elements (use event handler functions)
- Do NOT use `any` type
- Do NOT skip dark mode support
- Do NOT skip the verification steps
- Do NOT work on more than one story per iteration
