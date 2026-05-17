# Architecture Summary — One Page

## The Problem

PYQ Portal manages 530 PDFs across 4 years, 8 semesters, 45+ subjects. Manual manifest maintenance causes:
- Sync errors
- Outdated metadata
- Duplicate files in manifests
- Lost source-of-truth clarity

## The Solution

**Filesystem is truth. Everything else is generated.**

```
BTech_CSE/ (actual folders & PDFs)
     ↓
generate_manifest.py (auto-scan)
     ↓
website/folder_manifest.json (deployed)
     ↓
website/script.js (renders)
     ↓
GitHub Pages (public)
```

## Core Rules

| Principle | Implication |
|-----------|-------------|
| **Filesystem = source of truth** | Only add/rename/delete folders & PDFs in `BTech_CSE/`. Never manually edit manifests. |
| **Static + GitHub Pages** | No databases, no backends, no deployments. Works offline. |
| **Automation-first** | Manifests regenerate automatically via GitHub Actions or local script. |
| **Recursively scalable** | Folder depth supports any hierarchy without code changes. |
| **No over-engineering** | Keep it simple. Add complexity only when necessary. |

## Current Stack

- **Language**: Python (`generate_manifest.py`)
- **Hosting**: GitHub Pages (static, free)
- **Rendering**: Vanilla JS (`script.js`)
- **Manifest**: JSON (human-readable)
- **Admin**: Manual filesystem edits (simple, controlled)

## Future: Admin Dashboard

Optional **localhost-only** Node.js dashboard to simplify uploads:

- Upload PDF
- Create folder
- Rename/delete items
- Auto-regenerate manifest
- Optional git push

Keeps filesystem-native design without exposing it to users.

## Key Files

| File | Purpose |
|------|---------|
| `BTech_CSE/` | Source data (Years/Semesters/Subjects/PDFs) |
| `website/folder_manifest.json` | Active manifest (auto-generated) |
| `website/script.js` | Recursive renderer |
| `generate_manifest.py` | Manifest generator |
| `docs/ARCHITECTURE.md` | Full specification |

## What NOT to Do

- ❌ Add databases (PostgreSQL, MongoDB, Firebase)
- ❌ Deploy backends (Heroku, AWS, GCP)
- ❌ Use Next.js or React unnecessarily
- ❌ Manually edit manifests
- ❌ Create admin UIs that expose internals
- ❌ Store state outside filesystem

## What to Do When

**When adding PDFs:**
1. Create folder in `BTech_CSE/Year_X/Sem_Y/Subject_Z/`
2. Add `.pdf` files
3. Run `python generate_manifest.py`
4. Commit & push
5. GitHub Actions auto-deploys

**When modifying folder structure:**
1. Rename/move folders in `BTech_CSE/`
2. Run `python generate_manifest.py`
3. Commit & push
4. Done—no code changes

**If building admin dashboard later:**
1. Node.js backend (Express)
2. Upload handler
3. Auto-run `generate_manifest.py`
4. Auto-commit if desired
5. Keep localhost-only

## Philosophy Summary

> **Simple is maintainable. Maintainable is sustainable.**

This system prioritizes:
1. **Low friction** — Add files, run one command
2. **High visibility** — All data visible in folders
3. **Zero risk** — No databases to corrupt, no servers to fail
4. **Future-proof** — Filesystem will outlive any framework

---

**Full specification**: See [ARCHITECTURE.md](ARCHITECTURE.md)
