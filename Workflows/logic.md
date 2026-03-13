# Cosimo Workflows — Technical Architecture

This document covers how the system actually works under the hood.

---

## 1. Core Execution Model: Recursive Agent Loops

Workflows do not execute as a single monolithic agent call. Each workflow is decomposed into discrete steps, and **each step is executed by a fresh agent instance** that is spun up, given a scoped task, completes it, and is terminated. This is similar to the "Ralph Loop" pattern we use for development — iterative fresh-context execution with state persisted to files, not memory.

A complex workflow (like a 25-worksheet valuation output with 100+ individual steps) would exceed any single context window and degrade in quality as context grows. By killing the agent after each step and spinning up a fresh one, we get consistent high-quality output on step 1 and step 100.

**How it works:**

```
workflow.md (the blueprint — persistent on disk)
    │
    ├── Step 1 → Spin up Agent → Reads workflow.md + Reads progress.md + step 1 scope → Executes → Writes output → Updates progress.md → Agent killed
    ├── Step 2 → Spin up Agent → Reads workflow.md + Reads progress.md + step 2 scope + step 1 output → Executes → Writes output → Updates progress.md → Agent killed
    │   ...
    └── Step N → Final agent → Reads workflow.md + Reads progress.md + assembles final output → Done
```

Each agent receives:
- The `workflow.md` file (high-level blueprint, schemas, rules — never changes during a run)
- The specific step definition (what to do, what inputs to expect, what output to produce)
- Outputs from prior steps (only the ones this step needs — not the entire history)
- Any relevant lessons from the Brain (predetermined from the workflow build)

The agent does NOT receive the full run history or prior agents' reasoning. Clean context, scoped task, high-quality output.

**Each step is essentially a lesson** — a structured, repeatable instruction set. The difference is that workflow steps are chained and ordered, while standalone lessons are invoked ad hoc. Under the hood, the execution primitive is the same.

---

## 2. Workflow Creation: Conversational with Recursive Sub-Agents

Users create workflows by talking to Cosimo in Chat. There is no form-based workflow builder. Cosimo asks questions, proposes a flow graph, and iterates until the user is satisfied.

**The creation conversation is guided by `createworkflow.md`** — a reference document that gives Cosimo a structured set of questions to work through. This is NOT a rigid script. It's a checklist of things Cosimo needs to nail down, and Cosimo should **ask, not assume** at every step. Example areas the doc covers:

- What triggers this workflow? (manual, folder watch, chat command, schedule, chained)
- What input documents are involved? What varies between runs?
- What does the output look like? Format, columns, destination?
- Where does human review need to happen?
- Who else needs to interact with this workflow? (org visibility, inter-user gates)
- What lessons already exist that apply here?

**Complex workflows require recursive sub-conversations.** When Cosimo is building a workflow with 25 worksheets and 100+ steps, it cannot hold the entire design in a single conversation context. Instead:

1. The top-level conversation establishes the high-level flow graph (phases, branches, gates, inputs, outputs)
2. For each major section, Cosimo spins up a sub-conversation (invisible to the user or surfaced as a "working on it" state or a "side bar" dicussion by dropping in the right nav chat ux) to design the detailed step sequence
3. Each sub-conversation produces a section of the `workflow.md` file
4. The sub-agent is killed, and Cosimo returns to the top-level conversation with a summary

The user experiences this as one conversation. Under the hood, it's a tree of scoped agent calls assembling pieces of the workflow definition.

**Editing works the same way.** Users say "change step 14 to also check for duplicate parcel IDs" and Cosimo modifies the relevant section of `workflow.md`. No UI for drag-and-drop editing — Cosimo is the editor. The UX provides a visual flow graph so users can **inspect** what Cosimo built, but all changes flow through conversation.

---

## 3. The workflow.md File

Every workflow produces a `workflow.md` file that is the single source of truth. It contains:

- **Metadata:** name, version, owner, org visibility, status, trigger config
- **Input schema:** expected document types, field definitions, variability rules (see section 6)
- **Output schema:** format, columns, destination, per-output-file definitions for multi-output workflows
- **Flow graph:** ordered list of steps with branching logic, gate conditions, and dependencies
- **Step definitions:** for each step — what the agent should do, what inputs it reads, what output it produces, which lesson to apply, what constitutes success/failure
- **Gate definitions:** where human review is required, who gets notified, what they need to decide

This file is what every agent reads at the start of its step execution. It's the equivalent of `CLAUDE.md` in a Ralph Loop — the persistent context that survives across agent lifetimes.

---

## 4. Human-in-the-Loop: Gates and Inter-User Interaction

Gates are points in the workflow where execution pauses and a human must act before proceeding. There are two types:

**Designed gates** — the workflow creator placed these intentionally. "Always have the CFO review before generating the final output." These are nodes in the flow graph.

**Auto gates** — Cosimo hits something unexpected at runtime (low confidence extraction, conflicting data, unknown format) and creates an ad hoc gate. The default behavior when confused is: stop and ask.

**How gates work at runtime:**
1. Agent completes a step and determines a gate is needed (either because the flow graph says so, or because it encountered an exception)
2. The run pauses. Status changes to `waiting`.
3. Cosimo posts a message in the Chat thread explaining what it needs: what happened, what it's unsure about, what decision is required
4. The designated reviewer responds in natural language
5. Cosimo parses the response, updates the run state, and spins up the next agent to continue

**Inter-user gates** — the person creating the workflow may not be the person who reviews at runtime. The workflow definition specifies WHO gets notified at each gate. This means:

- Gates can target specific users or roles ("send to CFO for approval")
- The notification goes via email or in-app alert, linking to the Chat thread
- The reviewer may be someone who didn't create the workflow and doesn't have full context — so the gate message must be self-contained and clear
- The reviewer responds in the thread; Cosimo resumes

**This requires the thread to be readable by multiple users.** The workflow's org visibility setting (see section 5) controls this.

---

## 5. Org Visibility and Permissions

Workflows have a visibility toggle:

- **Private** (default): only the creator can see and run the workflow
- **Org-wide**: anyone in the organization can see, run, and be assigned as a gate reviewer

When a workflow is org-wide:
- It appears in every user's Workflow Library
- Any user can trigger a run
- Gate notifications can target any user in the org
- Run threads are visible to all users involved in that run
- The `workflow.md` file is shared — edits by anyone (via Cosimo) are versioned

This is a simple binary toggle for now. Role-based permissions (editor vs. viewer vs. runner) can come later.

---

## 6. Input Schema Flexibility

Real-world inputs are messy. The input schema system handles three levels of variability:

**Fixed schema** — every run gets the same document structure. Example: a monthly fee calculation that always reads from the same commitment schedule format. The schema defines exact fields and types.

**Variable-but-typed schema** — the documents are the "same kind of thing" but vary in format. Example: rent rolls from 40 different property managers, each with different column names, layouts, and quirks. The schema defines the **target fields** (Unit ID, Tenant, Rent, etc.) and Cosimo's extraction step is responsible for mapping whatever it receives onto those fields. This is where lessons are critical — each property manager's format gets a lesson that teaches Cosimo the mapping.

**Loose schema** — the workflow accepts "whatever documents are relevant." Example: due diligence on a new acquisition where the data room contents are unpredictable. The schema defines **document categories** (financials, environmental, title, etc.) and Cosimo classifies and routes at runtime.

**Multiple input files per run** are the norm, not the exception. The input manifest tracks exactly which files were fed in, and the step execution model means each file (or batch of files) can be processed by its own agent instance in parallel if the flow graph allows it.

---

## 7. Multiple Outputs

Some workflows produce a single file. Many produce multiple outputs:

- A valuation workflow produces a filing package per parcel (47 parcels = 47 output files + 1 summary)
- A financial statements workflow produces balance sheet, income statement, cash flow, and notes as separate worksheets or files
- A DD workflow produces a summary report plus individual analysis per document category

The output schema in `workflow.md` defines:

- **Per-output definitions:** name pattern, format, destination, which steps produce it
- **Assembly rules:** how individual step outputs combine into final deliverables
- **The output manifest** on each run tracks exactly what was produced and where it went

---

## 8. Workflow Chaining

A workflow's trigger config can include `chained` — meaning it starts automatically when another workflow's run completes successfully.

Example: Book-keeping workflow completes → automatically triggers Financial Statements workflow, passing the book-keeping output as input.

**How chaining works:**
1. Workflow A's final step completes. Run status → `completed`.
2. The harness checks if any workflow has a chain trigger pointing to Workflow A.
3. If so, it creates a new run of Workflow B, populating the input manifest with Workflow A's output manifest.
4. A new Chat thread is created for the chained run (or it continues in the same thread — this is a UX decision we can make later).

Chains can be multi-level (A → B → C) but not circular. The system should validate this on workflow creation.

**Chain conditions** can also be partial: "only trigger if Workflow A completed with zero exceptions" or "only trigger on the monthly schedule run, not manual runs." These conditions live in the trigger config.

---

## 9. Lessons Integration

Lessons and workflow steps are deeply connected:

- A workflow step can reference a specific lesson: "use the `rent-roll-hilgard-format` lesson when extracting from Hilgard property files"
- Lessons can be created DURING workflow creation — Cosimo's recursive sub-conversations can identify that a new lesson is needed and create it inline
- At runtime, when a step's agent is spun up, the relevant lesson is included in its context alongside the step definition
- When Cosimo encounters a new pattern at runtime (e.g., a rent roll format it hasn't seen before), it can create a new lesson from the experience and link it to the workflow step for future runs

Lessons are the mechanism by which workflows get smarter over time without being rebuilt.

---

## 10. Data Storage Architecture

Where things live:

| Data | Location | Notes |
|------|----------|-------|
| `workflow.md` files | Per-client storage (on-prem or cloud) | The workflow blueprint — versioned |
| Step outputs (intermediate) | Temp storage, cleaned after run completes | Large files, short-lived |
| Final outputs | Client-specified destination (folder, system) | Permanent |
| Run logs | SQL DB | Metadata, node statuses, exceptions, timing |
| Run conversations | Chat storage | Full thread history for audit trail |
| Lessons | Knowledge graph + vector store | Depending on client's data architecture |
| Input files | Client's existing file storage | Cosimo reads from wherever they already are |

The workflow system does not mandate a single storage backend. It adapts to each client's existing infrastructure — the harness abstracts file access.

---

## 11. Open Questions for Implementation

1. **Agent orchestration runtime:** What manages the spin-up/kill cycle for step agents? Is this the harness layer Shairq is building, or a separate orchestrator?
2. **Parallel step execution:** The flow graph supports branches (parallel paths). Do we run parallel step agents concurrently, or sequentially? Concurrency is faster but harder to debug.
3. **Step output format:** What's the intermediate format between steps? JSON? Files on disk? A structured message passed through the harness?
4. **Chain thread behavior:** When Workflow A triggers Workflow B, does B get its own Chat thread or continue in A's thread? Separate is cleaner for audit; combined is better for user context.
5. **Lesson versioning during runs:** If a lesson is updated mid-run (by another user or another run), does the current run use the original or updated version? Recommend: pin lesson version at run start.
6. **Max workflow complexity:** Do we need guardrails on step count or depth? A 200-step workflow is technically possible but may need a different UX for monitoring.
7. **Offline / async gates:** If a gate reviewer doesn't respond for 48 hours, what happens? Escalation? Timeout? Auto-proceed with Cosimo's best guess + flag?