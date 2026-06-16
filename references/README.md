# Local Reference Sources

This directory documents local source checkouts used for development reference. The actual source folders live under `references/sources/` and are ignored by Git so this repository does not vendor large external projects.

## Checkouts

| Project | Local path | Upstream |
| --- | --- | --- |
| OpenDesign | `references/sources/open-design` | `https://github.com/nexu-io/open-design.git` |
| PM Skills | `references/sources/pm-skills` | `https://github.com/phuryn/pm-skills.git` |

## Refresh

```bash
git -C references/sources/open-design pull --ff-only
git -C references/sources/pm-skills pull --ff-only
```

## Use

- Use OpenDesign for agent adapter, skill injection, artifact preview, design-system, plugin, and workflow architecture references.
- Use PM Skills for PRD, discovery, strategy, market research, user story, roadmap, prioritization, pre-mortem, and AI shipping workflow references.
- Copy patterns deliberately into PM Studio code. Do not import from these folders at runtime.
