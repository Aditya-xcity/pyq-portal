# PYQ Portal

A filesystem-driven, GitHub Pages-compatible portal for managing and distributing BTech CSE previous year questions (PYQs).

## Architecture

For complete system architecture, goals, and design specifications, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Quick Start

### Generate Manifest

```bash
python generate_manifest.py
```

This scans the `BTech_CSE/` folder and regenerates `website/folder_manifest.json`.

### Sync Folders (Windows)

```bash
sync_folders.bat
```

## Directory Structure

- `BTech_CSE/` — Source data (Years/Semesters/Subjects/PDFs)
- `website/` — Static website and manifests
- `docs/` — Documentation and architecture specs

## Manifest System

The active manifest is `website/folder_manifest.json`, generated automatically from the filesystem structure.

Legacy manifests (`pdf_manifest.json`, `pdf_manifest_github.json`) are archived in `website/archived/` for reference only.

## Philosophy

- **Filesystem is truth**: PDFs and folders are authoritative
- **Automated generation**: Manifests are built from filesystem, never manually edited
- **Static hosting**: Works perfectly on GitHub Pages
- **Low maintenance**: Minimal dependencies, no databases
- **Recursively scalable**: Folder structure automatically supports expansion

---

## Admin Dashboard

Complete localhost-only web interface for managing PDFs and deploying changes.

### Features

- 📤 Upload PDFs to any folder
- 📁 Create, rename, delete folders
- 🔄 Auto-regenerate manifests
- 🚀 Commit and push to GitHub directly from dashboard
- 🔒 Localhost-only (secure by default)

### Quick Start

**Windows:**
```bash
start_admin.bat
```

**Mac/Linux:**
```bash
bash start_admin.sh
```

Then open: **http://localhost:3000**

### Key Workflows

1. **Upload PDF**: Upload tab → enter path → select file → click Upload
2. **Create Folder**: Create Folder tab → enter path → click Create
3. **Deploy**: Deploy & Git → Commit tab → enter message → click "Commit & Push"

**Everything regenerates and deploys automatically.**

### Documentation

- [Admin Setup Guide](docs/ADMIN-SETUP.md) - Complete setup and usage instructions
- [Admin Deployment Guide](docs/ADMIN-DEPLOYMENT.md) - Architecture, workflows, troubleshooting
- [Admin README](admin/README.md) - Technical documentation

---

## Workflow

### Adding PDFs (Recommended)

1. Use admin dashboard: **http://localhost:3000**
2. Upload PDF to desired folder
3. Dashboard regenerates manifest + git commit + push automatically
4. GitHub Pages updates in ~30 seconds

### Adding Folders

1. Use admin dashboard: Create Folder tab
2. Enter folder path (e.g., `Year_3/Sem5/NewSubject`)
3. Dashboard regenerates manifest automatically

### Manual Method (CLI)

```bash
# Add files/folders manually to BTech_CSE/
python generate_manifest.py
git add .
git commit -m "Add new PDFs"
git push
```

GitHub Actions will also auto-regenerate manifest on push.
