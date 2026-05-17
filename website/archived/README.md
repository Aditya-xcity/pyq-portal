# Archived Manifests

This folder contains legacy manifest files that are no longer actively used.

## Files

- `pdf_manifest.json` — Original flat PDF index (archived)
- `pdf_manifest_github.json` — GitHub variant with repository references (archived)

## Why Archived?

These manifests were replaced by a more scalable recursive approach:

**Active manifest:** `website/folder_manifest.json`

The new system:
- Generates manifests **automatically** from the actual filesystem structure
- Supports **recursive folder hierarchies** (Years → Semesters → Subjects → Files)
- **Eliminates manual maintenance** and sync errors
- Works perfectly with the current **recursive rendering** in `website/script.js`

## Important

Do **NOT** delete these files yet. They are kept for:
1. Historical reference
2. Verifying that nothing silently depends on them
3. Gradual migration if needed

## When to Delete

Only delete these files after confirming:
- ✓ The active `website/folder_manifest.json` is generated and working
- ✓ The website renders correctly using only the active manifest
- ✓ No backend code references these legacy files
- ✓ No analytics or automation relies on these formats

**Current status**: Archived but retained (2026-05-17)
