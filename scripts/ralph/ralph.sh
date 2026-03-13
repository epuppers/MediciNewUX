#!/bin/bash
# Ralph — Autonomous AI agent loop for Workflows Rebuild
# Usage: ./ralph.sh [max_iterations]
#
# Based on snarktank/ralph with the prd.json completion check fix (PR #93)
# Instead of parsing Claude's output for <promise>COMPLETE</promise>,
# we check prd.json directly for remaining stories with passes=false.

set -e

MAX_ITERATIONS=30
if [[ "$1" =~ ^[0-9]+$ ]]; then
  MAX_ITERATIONS="$1"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"

# ─── Preflight checks ───────────────────────────────────────────────

if ! command -v claude &> /dev/null; then
  echo "Error: Claude Code CLI not found."
  echo "Install it: npm install -g @anthropic-ai/claude-code"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "Error: jq not found."
  echo "Install it: brew install jq (macOS) or sudo apt install jq (Linux)"
  exit 1
fi

if [ ! -f "$PRD_FILE" ]; then
  echo "Error: prd.json not found at $PRD_FILE"
  exit 1
fi

# Create progress.txt if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  cat > "$PROGRESS_FILE" << 'EOF'
# Progress Log — Workflows Rebuild

## Codebase Patterns
(Patterns discovered during iterations will be added here)

---

EOF
  echo "Created progress.txt"
fi

# ─── Branch setup ────────────────────────────────────────────────────

BRANCH_NAME=$(jq -r '.branchName' "$PRD_FILE")
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
  echo "Switching to branch: $BRANCH_NAME"
  git checkout "$BRANCH_NAME" 2>/dev/null || git checkout -b "$BRANCH_NAME"
fi

# ─── Completion check function ──────────────────────────────────────
# This is the fix from PR #93: check prd.json directly instead of
# parsing Claude's output for a promise string (which was unreliable).

check_prd_completion() {
  REMAINING=$(jq '[.userStories[] | select(.passes == false)] | length' "$PRD_FILE")
  if [ "$REMAINING" -eq 0 ]; then
    return 0  # All done
  else
    return 1  # Stories remain
  fi
}

# ─── Show initial status ────────────────────────────────────────────

TOTAL=$(jq '.userStories | length' "$PRD_FILE")
DONE=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
REMAINING=$((TOTAL - DONE))

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║          Ralph — Workflows Rebuild               ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Branch:     $BRANCH_NAME"
echo "║  Stories:    $DONE/$TOTAL complete ($REMAINING remaining)"
echo "║  Max iter:   $MAX_ITERATIONS"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── Check if already complete ───────────────────────────────────────

if check_prd_completion; then
  echo "All stories already complete! Nothing to do."
  exit 0
fi

# ─── Main loop ───────────────────────────────────────────────────────

for (( i=1; i<=MAX_ITERATIONS; i++ )); do
  DONE=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
  REMAINING=$((TOTAL - DONE))
  NEXT_STORY=$(jq -r '[.userStories[] | select(.passes == false)][0] | "\(.id): \(.title)"' "$PRD_FILE")

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Iteration $i of $MAX_ITERATIONS"
  echo "  Progress: $DONE/$TOTAL complete ($REMAINING remaining)"
  echo "  Next story: $NEXT_STORY"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Spawn a FRESH Claude Code instance
  # --dangerously-skip-permissions: allows file edits without prompting
  # --print: non-interactive mode, exits when done
  # The CLAUDE.md prompt is piped via stdin
  OUTPUT=$(claude --dangerously-skip-permissions --print < "$SCRIPT_DIR/CLAUDE.md" 2>&1 | tee /dev/stderr) || true

  echo ""
  echo "  [Iteration $i complete]"

  # Check completion via prd.json (not output parsing)
  if check_prd_completion; then
    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║       🎉 Ralph completed all tasks! 🎉           ║"
    echo "║       Finished at iteration $i of $MAX_ITERATIONS"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""

    # Final status
    echo "Stories completed:"
    jq -r '.userStories[] | "  ✓ \(.id): \(.title)"' "$PRD_FILE"
    echo ""
    echo "Review commits: git log --oneline"
    echo "Push when ready: git push origin $BRANCH_NAME"
    exit 0
  fi

  # Brief pause between iterations
  sleep 2
done

# ─── Max iterations reached ──────────────────────────────────────────

DONE=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
REMAINING=$((TOTAL - DONE))

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Max iterations reached ($MAX_ITERATIONS)"
echo "║  Progress: $DONE/$TOTAL complete ($REMAINING remaining)"
echo "╚══════════════════════════════════════════════════╝"
echo ""

echo "Remaining stories:"
jq -r '.userStories[] | select(.passes == false) | "  ✗ \(.id): \(.title)"' "$PRD_FILE"
echo ""
echo "To continue: ./ralph.sh $MAX_ITERATIONS"
exit 1
