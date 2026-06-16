# GitHub Sync

## Remote

```bash
origin https://github.com/Maggyee/pmstudio.git
```

## Current Branch

```bash
main
```

The branch tracks `origin/main`.

## Sync Routine

```bash
git status --short --branch
npm run lint
npm run build
git add .
git commit -m "Set up PM Studio engineering harness"
git push origin main
```

If GitHub authentication fails, do not rewrite history. Re-authenticate the local Git credential helper or push from a terminal that already has access.
