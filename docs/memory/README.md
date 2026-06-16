# Memory Index

This directory is durable project memory. It is deliberately split so future agents can read high-signal context first and avoid loading every historical note.

## Read Order

1. `project-context.md` for the product and target users.
2. `decisions.md` for decisions that should not be re-litigated casually.
3. `../progress/current-sprint.md` for the active work plan.

## Memory Rules

- Put stable context here, not transient task notes.
- Record decisions with a date and reason.
- Keep implementation progress in `docs/progress/`.
- Keep engineering contracts in `docs/engineering/`.
