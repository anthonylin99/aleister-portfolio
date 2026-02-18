# Aleister — Agent Context

> This repository treats AI coding assistants as **engineering teammates**.
> Optimize for: correctness, readability, maintainability, and predictable change.

**Stack:** Next.js 16, TypeScript, Tailwind, Upstash Redis, Yahoo Finance, lightweight-charts, Anthropic Claude.

**Live:** https://aleister-portfolio.vercel.app/

---

## Quick Reference

| Doc | Purpose |
|-----|---------|
| **CLAUDE.md** (this) | Universal rules, workflow, recent changes |
| **[bible.md](./bible.md)** | Engineering principles, architecture standards |
| **[docs/agent-bible.md](./docs/agent-bible.md)** | Extended philosophy — *internalize when time allows* |

---

## Prime Directive: Do No Harm

- Prefer **small, reviewable diffs** over sweeping rewrites
- Preserve existing architecture and conventions unless explicitly asked
- If requirements are ambiguous, **pause and ask** or propose 2–3 options with tradeoffs

---

## Default Operating Loop

```
Scan → Plan → Implement → Verify → Summarize
```

1. **Scan** — Identify relevant files, patterns, and invariants in the repo
2. **Plan** — Write a short plan (bullets): files touched, tests to run, edge cases
3. **Implement** — Minimal diff; reuse existing utilities; keep naming consistent
4. **Verify** — Run tests/linters/build; fix failures; re-run until clean
5. **Summarize** — Explain what changed, why, how to test, and any risks

---

## Quality Gates (Non-Negotiable)

Before marking work "done":
- [ ] `npx tsc --noEmit` passes
- [ ] Lint/format passes
- [ ] Build succeeds
- [ ] No debug prints, commented-out code, or dead code paths
- [ ] Edge cases handled (nulls, empty inputs, timeouts, permissions)
- [ ] No secrets in code — use env vars

---

## Consistency > Personal Preference

- Match the repo's **style** (naming, patterns, error handling, folder structure)
- Don't introduce new libraries/frameworks unless approved
- If a pattern exists (even if imperfect), follow it, then suggest improvements separately

---

## Git Hygiene

- Atomic commits with clear messages: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`
- Avoid mixing refactors with feature changes
- If a change touches many files, explain why and how to review safely

---

## Error Handling & Security

- Fail loudly when invariants are violated — no empty catch blocks
- Validate all external inputs
- Never print secrets; use env vars/secret managers
- Log with context (request id, correlation id) but redact sensitive data

---

## When Uncertain

**Ask.** A quick clarifying question beats a wrong implementation.

Good questions:
- "Should this handle X edge case, or is that out of scope?"
- "I see two patterns for this. Which should I follow?"

Bad assumptions:
- Guessing at requirements
- Inventing features not requested

---

## When Stuck

- State what you tried, what you observed, and the smallest next experiment
- Use checkpoints: if a path is risky, make a commit before proceeding

---

## Env

```bash
ANTHROPIC_API_KEY=sk-ant-...      # Required for AI analysis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Key Paths

| Area | Path |
|------|------|
| Dashboard | `src/app/dashboard/page.tsx` |
| Holdings | `src/app/holdings/page.tsx`, `src/components/tables/HoldingsTable.tsx` |
| Dip Finder | `src/app/dip-finder/page.tsx`, `src/lib/sma-service.ts` |
| AI Thesis | `src/app/api/ai/generate-thesis/route.ts` |
| Yahoo + Redis | `src/lib/yahoo-finance.ts`, `src/lib/redis.ts` |
| Collections | `src/data/collections-seed.ts` |

---

## Recent Changes

### Security Fix (Latest)
- `/api/prices` now requires authentication — no more public portfolio exposure
- Dashboard shows sign-in prompt when unauthenticated
- Fixed dip-finder client/server boundary issue (types moved to `src/types/sma.ts`)

### Aleister Sprint
- **Dip Finder** — SMA dispersion chart at `/dip-finder`
- **Edit Holdings** — modal for shares, cost basis, category
- **Multi-Stock Chart** — compare N stocks
- **Category Analytics** — live analytics on explore pages
- **Luma Design** — CSS tokens, BentoGrid, Skeleton loaders

---

## Cross-editor Sync

Single source of truth: **git remote** (`origin`).
- After Claude Code: run `git pull` in Cursor
- After Cursor: push, then pull in Claude Code
