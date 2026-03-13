# Ralph — Autonomous Agent Instructions

You are one iteration of an autonomous coding loop. You have a FRESH context — no memory of previous iterations. Your knowledge comes from: the codebase on disk, prd.json, progress.txt, and CLAUDE.md.

## Your Workflow (follow this exactly)

1. **Read the project CLAUDE.md** at the project root — it contains the full architecture, design system, data models, mock conversation scripts, and code conventions. Read it thoroughly before touching any code.

2. **Read prd.json** (in the `scripts/ralph/` directory) — find the first user story where `"passes": false`. That is your ONE task.

3. **Read progress.txt** (in the `scripts/ralph/` directory) — check the Codebase Patterns section first, then review recent iteration notes for context on what's been done and any gotchas.

4. **Check you're on the correct branch** from prd.json `branchName`. If not, check it out or create it from main.

5. **Implement the ONE story.** Do not work on any other story. Follow ALL rules from CLAUDE.md:
   - ALL colors use `var(--token)` from tokens.css — no raw hex/rgb
   - ALL new CSS includes dark mode overrides in the same file
   - ALL new interactive elements have hover, active, focus-visible states
   - ALL animations respect `[data-a11y-motion="reduced"]`
   - Use event delegation in `initEventListeners()` — no inline handlers
   - Mock data uses `MOCK_` prefix, goes in `js/mock-data.js`
   - New JS functions go in the appropriate namespace (`UI`, `Chat`, `A11y`, etc.)
   - Preserve ALL existing functionality

6. **Verify the dev server loads:**

   ```bash
   cd /Users/eliotpuplett/Documents/MediciCode/MediciNewUX && python3 -m http.server 8082 &
   sleep 2
   STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/index.html)
   kill %1 2>/dev/null
   ```

   If status is not 200, fix the issue before proceeding.

7. **If all checks pass, commit:**

   ```bash
   git add -A
   git commit -m "polish [TASK_ID]: [brief description]"
   ```

   Do NOT git push — human will push after reviewing.

8. **Update prd.json** — set `"passes": true` for the story you just completed.

9. **Update progress.txt** — append a section like:

   ```
   ## Iteration [N] — Task [ID]: [Title]
   - What was done: [brief summary]
   - Files modified: [list]
   - Gotchas / learnings: [anything the next iteration should know]
   ```

   ### Codebase Patterns

   If you discovered reusable patterns, add them to the Codebase Patterns section at the top of progress.txt:
   - Only add patterns that are general and reusable, not story-specific details.

10. **Stop.** Do not continue to the next story. The loop will spawn a fresh instance for it.

## Critical Rules

- **ONE story per iteration.** Never combine tasks.
- **Do not output `<promise>COMPLETE</promise>` or any completion signal.** The shell script checks prd.json directly — you don't need to signal anything.
- **If you can't complete the story** (blocked, unclear requirement, broken dependency), still update progress.txt explaining WHY, set the story's passes to false, and stop. The human will intervene.
- **If the dev server doesn't load after your changes**, revert and try a different approach. Do not commit broken code.
- **Read CLAUDE.md first, every time.** You have no memory. The project docs ARE your memory.

## Key Architecture Reminders

These corrections are polish/fixes on an existing codebase. Key files:

- **index.html** — Single-file HTML with all views (chat threads, workflows, brain sections)
- **js/app.js** — All behavior. Namespaces: A11y, UI, Chat, Workflows, BrainMemory, BrainLessons, Graph
- **js/mock-data.js** — All mock data objects (MOCK\_ prefix)
- **js/icons.js** — ICONS object + icon() helper + injectIcons()
- **css/tokens.css** — Design tokens, color scales, fonts, reset
- **css/layout.css** — Sidebar, top bar, main frame, dropdown panels, a11y modes
- **css/chat.css** — Chat threads, input area, messages, workflow panel
- **css/components.css** — Brain sections, flow graph, popovers, shared components
- **css/workflows.css** — Workflow library cards, detail view
- **css/utilities.css** — Dropdown menus, utility classes, scrollbar styles

## Design System Essentials

- **Beveled borders (raised):** `border-color: var(--taupe-2) var(--taupe-3) var(--taupe-3) var(--taupe-2)` — light top-left, dark bottom-right
- **Beveled borders (inset):** `border-color: var(--taupe-3) var(--taupe-1) var(--taupe-1) var(--taupe-3)` — dark top-left, light bottom-right
- **Alpha colors:** `rgba(var(--violet-3-rgb), 0.1)` — use the -rgb triplet tokens
- **Border radii:** `var(--r-xs)` 2px, `var(--r-sm)` 3px, `var(--r-md)` 4px, `var(--r-lg)` 6px, `var(--r-pill)` 9px
- **Fonts:** ChicagoFLF (pixel headings), IBM Plex Mono (UI/code), DM Sans (body)
- **Dark mode:** Same token names redefined under `[data-theme="dark"]` in tokens.css — no dk- prefix
