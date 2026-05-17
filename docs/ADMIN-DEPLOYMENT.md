# Complete Admin System - Implementation Summary

## What We Built

A **complete, production-ready admin system** for managing the PYQ Portal:

```
┌──────────────────────────────────────────────────────────────┐
│  Admin Dashboard (localhost:3000)                            │
│                                                              │
│  📂 File Management        │    🚀 Deploy & Git             │
│  - Upload PDF              │    - Git Status                │
│  - Create Folder           │    - Commit Changes            │
│  - Rename/Delete Files     │    - Push to GitHub            │
│  - Browse Structure        │    - Regenerate Manifest       │
└──────────────────────────────────────────────────────────────┘
           ↓ (Secure, localhost-only)
┌──────────────────────────────────────────────────────────────┐
│  Express Backend (server.js)                                 │
│                                                              │
│  • File upload & validation                                 │
│  • Folder operations (create/rename/delete)                 │
│  • Git integration (commit/push)                            │
│  • Manifest regeneration (python generate_manifest.py)      │
│  • Path security validation                                 │
└──────────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────────┐
│  Filesystem & Git                                            │
│                                                              │
│  BTech_CSE/ ← PDFs & folders                                │
│  website/folder_manifest.json ← Generated manifest          │
│  .git/ ← Git repository                                     │
└──────────────────────────────────────────────────────────────┘
           ↓ (GitHub Actions auto-runs on push)
┌──────────────────────────────────────────────────────────────┐
│  GitHub Pages                                                │
│                                                              │
│  website/ → Deployed live                                   │
│  folder_manifest.json → Auto-regenerated & committed        │
└──────────────────────────────────────────────────────────────┘
```

## Files Created

### Core Admin System

| File | Purpose |
|------|---------|
| `admin/server.js` | Express backend with all API endpoints |
| `admin/public/index.html` | Beautiful admin dashboard UI |
| `admin/package.json` | Node.js dependencies (express, multer, simple-git) |
| `admin/README.md` | Admin system documentation |
| `admin/.gitignore` | Node modules excluded from git |

### Startup Scripts

| File | Purpose |
|------|---------|
| `start_admin.bat` | Windows: One-click startup |
| `start_admin.sh` | Mac/Linux: One-click startup |

### Documentation

| File | Purpose |
|------|---------|
| `docs/ADMIN-SETUP.md` | Complete setup & usage guide |
| `docs/ADMIN-DEPLOYMENT.md` | This file |
| Updated `README.md` | Links to admin dashboard |

---

## Installation (First Time)

### Prerequisites
```bash
# Check Node.js installed (14+)
node --version

# Check Python installed (3.x)
python --version

# Check Git installed
git --version
```

### Setup Admin System

**Windows:**
```bash
start_admin.bat
```

**Mac/Linux:**
```bash
bash start_admin.sh
```

This will:
1. ✅ Install Node.js dependencies
2. ✅ Start Express server on localhost:3000
3. ✅ Print "✓ Server running at: http://localhost:3000"

### First Launch

1. Open browser: `http://localhost:3000`
2. You should see the dashboard with:
   - 📂 File Management (Upload, Create, Manage)
   - 🚀 Deploy & Git (Status, Commit, Manifest)

---

## Core Features

### 1. PDF Upload

**Dashboard:**
- Upload tab → Enter folder path → Select PDF → Upload

**Under the hood:**
- Multer validates file type (PDF only)
- File saved to correct folder in BTech_CSE/
- Manifest regenerated automatically
- Success/error message shown

**API:** `POST /api/upload`

### 2. Folder Management

**Dashboard:**
- Create tab → Enter path → Create folder
- Manage tab → Browse → Rename/Delete

**Under the hood:**
- Path validation (security: prevents escaping BTech_CSE/)
- Folders created recursively
- Manifest regenerated after each change
- Full filesystem consistency maintained

**APIs:**
- `POST /api/create-folder`
- `POST /api/rename`
- `DELETE /api/delete`

### 3. Auto-Regeneration

**After any change:**
- Python script runs: `python generate_manifest.py`
- Scans BTech_CSE/ structure
- Updates website/folder_manifest.json
- Returns status to dashboard

**Manifest reflects:**
- Years → Semesters → Subjects → Papers
- File sizes and metadata
- Recursive structure preserved
- Ready for website rendering

### 4. Git Integration

**Dashboard:**
- Status tab → See modified files
- Commit tab → Write message → Push to GitHub

**Automated:**
- `git add .` stages all changes
- `git commit -m "message"` commits locally
- `git push` deploys to GitHub
- GitHub Actions regenerates manifest automatically

**APIs:**
- `POST /api/git/status`
- `POST /api/git/commit`
- `POST /api/git/push`
- `POST /api/git/commit-and-push`

### 5. Security

**Localhost-only:**
```javascript
// server.js rejects non-localhost connections
const host = req.get('host');
if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
  return res.status(403).json({ error: 'Admin dashboard is localhost-only' });
}
```

**Path validation:**
```javascript
// Prevents directory traversal attacks
const resolvedPath = path.resolve(fullPath);
const basePath = path.resolve(path.join(__dirname, '../BTech_CSE'));
if (!resolvedPath.startsWith(basePath)) {
  return res.status(403).json({ error: 'Invalid path' });
}
```

**File type validation:**
```javascript
// Only PDFs allowed for upload
const allowedExt = ['.pdf'];
if (!allowedExt.includes(ext)) {
  cb(new Error('Only PDF files allowed'));
}
```

---

## Deployment Workflow

### Step 1: Add Content

```
Dashboard: Upload tab
↓
Select PDF + folder path
↓
Click Upload
```

### Step 2: Auto-Regeneration

```
Backend receives upload
↓
Validates & saves file
↓
Runs: python generate_manifest.py
↓
Manifest updated automatically
```

### Step 3: Deploy

```
Dashboard: Deploy & Git → Commit tab
↓
Write message: "Add Q1 2025 papers"
↓
Click "Commit & Push"
↓
Backend runs: git add . && git commit && git push
```

### Step 4: GitHub Actions

```
GitHub receives push
↓
Workflow: .github/workflows/regenerate-manifest.yml
↓
Runs: python generate_manifest.py
↓
Auto-commits if manifest changed
↓
GitHub Pages rebuilds (~30 sec)
```

### Step 5: Live

```
Website: https://yourusername.github.io/pyq-portal/
↓
Loads website/index.html
↓
Reads website/folder_manifest.json
↓
Renders folder structure + PDFs
↓
✅ Live!
```

---

## Example: Add 5 New Papers

### Manual Approach (Old)
```bash
1. Create folder manually
2. Copy PDFs manually  
3. Run python generate_manifest.py
4. git add .
5. git commit -m "..."
6. git push
7. Wait for GitHub Pages...
```

### New Dashboard Approach
```
1. Go to http://localhost:3000
2. Upload tab, upload PDF #1 (auto-regenerates)
3. Upload tab, upload PDF #2 (auto-regenerates)
4. Upload tab, upload PDF #3 (auto-regenerates)
5. Upload tab, upload PDF #4 (auto-regenerates)
6. Upload tab, upload PDF #5 (auto-regenerates)
7. Deploy & Git → Commit tab
8. Write message: "Add 5 new papers"
9. Click "Commit & Push" (auto-commits + pushes + regenerates)
10. ✅ Live!
```

**Result: Much faster, zero manual errors!**

---

## API Reference

### Upload File
```bash
POST /api/upload
Body: FormData {
  pdf: File,
  path: "Year_2/Sem4/Subject"
}
Response: { success: true, message: "...", file: "filename.pdf" }
```

### Create Folder
```bash
POST /api/create-folder
Body: { path: "Year_3/Sem5/NewSubject" }
Response: { success: true, message: "Created folder: ..." }
```

### Rename File/Folder
```bash
POST /api/rename
Body: { oldPath: "Year_2/Sem4/Old", newName: "New" }
Response: { success: true, message: "Renamed to New" }
```

### Delete File/Folder
```bash
DELETE /api/delete
Body: { path: "Year_2/Sem4/Subject/file.pdf" }
Response: { success: true, message: "Deleted ..." }
```

### Commit & Push
```bash
POST /api/git/commit-and-push
Body: { message: "Add new papers" }
Response: { 
  success: true, 
  message: "Committed and pushed",
  commit: "abc123...",
  push: {...}
}
```

### Get Git Status
```bash
POST /api/git/status
Response: {
  modified: ["file1.pdf", ...],
  created: ["file2.pdf", ...],
  deleted: ["file3.pdf", ...]
}
```

---

## Troubleshooting

### Port 3000 Already In Use
```bash
# Kill existing process
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Or change port in admin/server.js
const PORT = 3001;
```

### Git Credentials Error
```bash
# Configure git
git config user.name "Your Name"
git config user.email "your@email.com"
git config credential.helper store  # Save credentials
```

### Manifest Not Updating
```bash
# Manual regeneration
1. Dashboard → Deploy & Git → Manifest tab
2. Click "Regenerate Manifest"

# Or via CLI
python generate_manifest.py
```

### Node Modules Size
```bash
# If admin folder is too large
# Add to .gitignore (already done):
node_modules/
```

---

## Next: CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/regenerate-manifest.yml`) automatically:

1. Triggers on push to main
2. Runs `python generate_manifest.py`
3. Auto-commits if manifest changed
4. Uses `[skip ci]` to prevent infinite loops
5. GitHub Pages rebuilds

**No manual deployment needed!**

---

## What's Running Now

```
✅ Admin Dashboard:        http://localhost:3000
✅ Upload API:             POST /api/upload
✅ Folder APIs:            POST /api/create-folder, /api/rename, DELETE /api/delete
✅ Git APIs:               POST /api/git/*
✅ Manifest Generation:    Python auto-runs
✅ Security:               Localhost-only + path validation
✅ Documentation:          README.md, ADMIN-SETUP.md, this file
✅ Startup Scripts:        start_admin.bat, start_admin.sh
✅ GitHub Actions:         Auto-regenerate on push
```

---

## Summary

You now have:

1. **🎯 Complete admin system** - Upload, manage, deploy from one interface
2. **🔒 Secure by default** - Localhost-only, path validated, type-checked
3. **🚀 Automated** - Manifest auto-regenerates, GitHub Actions auto-deploys
4. **📱 Beautiful UI** - Modern dashboard with real-time status
5. **📚 Well-documented** - Setup guide, API reference, troubleshooting
6. **⚡ Fast workflow** - Upload PDF → Deploy in 2 clicks

**Everything is ready to use!**

---

## First Steps

1. ✅ Run `start_admin.bat` (Windows) or `bash start_admin.sh` (Mac/Linux)
2. ✅ Open http://localhost:3000
3. ✅ Try uploading a test PDF
4. ✅ Commit and push to GitHub
5. ✅ Watch GitHub Pages update automatically

**You're done!** 🎉
