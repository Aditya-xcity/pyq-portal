# PYQ Portal — Architecture Specification

## Core Philosophy

The system must remain:

* filesystem-driven
* GitHub Pages compatible
* static on the public side
* localhost-only on the admin side
* automation-first
* low maintenance
* recursively scalable

The filesystem is the single source of truth.

The project must NOT move toward:

* databases
* Firebase
* MongoDB
* cloud backends
* React/Next.js complexity

unless absolutely necessary in the future.

---

# Existing Architecture

Current architecture:

```txt
BTech_CSE/
        ↓
generate_manifest.py
        ↓
website/folder_manifest.json
        ↓
website/script.js recursively renders everything
```

This architecture is correct and must remain.

---

# Filesystem Is Source Of Truth

The actual folder structure inside:

```txt
BTech_CSE/
```

is authoritative.

Meaning:

* folders define hierarchy
* PDFs exist physically
* manifests are generated automatically
* frontend only reads manifests

Never manually edit:

* paths
* file sizes
* manifest metadata

All metadata must derive automatically from filesystem scanning.

---

# Public Website Rules

The public website must remain:

* static
* GitHub Pages compatible
* read-only
* manifest-driven

The public renderer architecture already works correctly and should not be rewritten unnecessarily.

Current recursive rendering logic is correct.

---

# Canonical Manifest

The project currently contains:

* folder_manifest.json
* pdf_manifest.json
* pdf_manifest_github.json

This creates duplication risk.

The system must migrate toward using ONLY:

```txt
website/folder_manifest.json
```

as the canonical manifest.

The other manifests are legacy and should be archived, not deleted immediately.

---

# Admin Dashboard Goal

Create a LOCAL admin dashboard for maintaining the portal.

The dashboard should:

* run only on localhost
* never be publicly deployed
* manage files/folders inside BTech_CSE
* regenerate manifests automatically
* optionally automate git operations

The admin dashboard is a maintenance tool, not a public feature.

---

# Proposed Project Structure

```txt
pyq-portal/
│
├── BTech_CSE/
│
├── website/
│   ├── folder_manifest.json
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── admin-dashboard/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server.js
├── package.json
├── generate_manifest.py
└── uploads-temp/
```

---

# Backend Stack

Use:

* Node.js
* Express.js
* Multer
* fs module
* path module
* child_process

Keep:

```txt
generate_manifest.py
```

Do not rewrite it initially.

The backend should invoke it automatically.

---

# Backend Responsibilities

The backend performs ALL write operations.

The public website remains read-only.

---

# Required Backend Features

## 1. Upload PDF Endpoint

Endpoint:

```txt
POST /upload
```

Responsibilities:

* receive uploaded PDF
* validate extension
* validate destination path
* move file into correct folder
* regenerate manifest automatically

Validation:

* allow only .pdf
* reject dangerous extensions
* reject empty uploads
* reject oversized uploads

Must handle:

* duplicate names
* special characters
* spaces
* interrupted uploads
* invalid folders
* path traversal attacks

All uploads must remain inside:

```txt
BTech_CSE/
```

---

# 2. Create Folder Endpoint

Endpoint:

```txt
POST /create-folder
```

Responsibilities:

* create folders recursively
* validate names
* regenerate manifest

Disallow invalid Windows filename characters.

---

# 3. Rename Endpoint

Endpoint:

```txt
POST /rename
```

Responsibilities:

* rename files/folders safely
* avoid collisions
* preserve extensions
* regenerate manifest

---

# 4. Delete Endpoint

Endpoint:

```txt
POST /delete
```

Responsibilities:

* delete files/folders safely
* support recursive deletion
* prevent deletion outside root
* regenerate manifest

---

# 5. Refresh Manifest Endpoint

Endpoint:

```txt
POST /refresh
```

Responsibilities:

* execute:

```txt
python generate_manifest.py
```

* regenerate:

```txt
website/folder_manifest.json
```

* return updated statistics

---

# Optional Git Automation

Future optional feature.

Possible endpoints:

```txt
POST /git/status
POST /git/push
```

Should support:

* git add
* git commit
* git push

This should remain MANUAL initially via button.

Do NOT auto-push after uploads.

---

# Admin Dashboard UI

The first admin version should remain intentionally simple.

Initial features:

* upload PDF
* create folder
* refresh manifest
* basic folder tree

Do NOT over-engineer initially.

---

# Suggested Admin Layout

```txt
┌──────────────────────────────┐
│ XVelocity Admin Dashboard    │
├──────────────────────────────┤
│ 📁 Folder Tree               │
│                              │
│ Year_2                       │
│   └── Sem4                   │
│       └── Java               │
│                              │
├──────────────────────────────┤
│ [ Upload PDF ]               │
│ [ Create Folder ]            │
│ [ Refresh Manifest ]         │
│ [ Git Push ]                 │
└──────────────────────────────┘
```

---

# Future Features

Future possible additions:

* right-click context menu
* drag & drop uploads
* PDF previews
* analytics
* search filters
* tags
* AI search
* duplicate detection
* bulk uploads
* undo system

These are NOT required initially.

---

# Right Click Context Menu (Future)

Eventually support:

```txt
Right Click
├── Upload PDF
├── Create Folder
├── Rename
├── Delete
├── Refresh
└── Open Folder
```

---

# Important Frontend Rule

Keep the recursive manifest structure.

Current recursive tree format:

```json
{
  "name": "Year_2",
  "children": []
}
```

is correct and scalable.

Do not flatten the core architecture.

---

# Optional Future Flat Search Index

Later optionally generate:

```txt
flat_index.json
```

alongside:

```txt
folder_manifest.json
```

This would help:

* searching
* filtering
* analytics
* quick lookup

But the recursive tree remains primary.

---

# Security Rules

Never allow:

* arbitrary command execution
* unrestricted filesystem access
* path traversal
* uploads outside root
* remote public admin access

All filesystem operations must remain restricted to:

```txt
BTech_CSE/
```

---

# Desired Final Workflow

Final intended workflow:

```txt
Open Admin Dashboard
        ↓
Upload PDF / Create Folder
        ↓
server.js updates filesystem
        ↓
generate_manifest.py runs automatically
        ↓
website/folder_manifest.json updates
        ↓
Optional Git Push
        ↓
GitHub Pages updates publicly
```

The purpose of this system is to eliminate all manual maintenance work while preserving a simple filesystem-native architecture.
