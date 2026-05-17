# Admin Dashboard Setup & Usage Guide

Complete guide for setting up and using the PYQ Portal admin dashboard.

## What's the Admin Dashboard?

The admin dashboard is a **localhost-only web interface** for:
- ✅ Uploading PDFs
- ✅ Creating/renaming/deleting folders  
- ✅ Auto-regenerating manifests
- ✅ Committing and pushing to GitHub
- ✅ Monitoring git status

Everything is **automated and secure** by default.

---

## System Requirements

- **Node.js 14+** ([download](https://nodejs.org/))
- **Python 3.x** (for manifest generation)
- **Git** (for version control)
- **Windows, Mac, or Linux**

---

## Installation (First Time Only)

### Option 1: Automatic (Recommended)

**Windows:**
```bash
start_admin.bat
```

**Mac/Linux:**
```bash
bash start_admin.sh
```

This script automatically installs dependencies and starts the server.

### Option 2: Manual

```bash
# Navigate to admin folder
cd admin

# Install dependencies
npm install

# Start the server
npm start
```

---

## Starting the Dashboard (After Initial Setup)

**Windows:**
```bash
start_admin.bat
```

**Mac/Linux:**
```bash
bash start_admin.sh
```

Or manually:
```bash
cd admin
npm start
```

Then open your browser: **http://localhost:3000**

You should see the dashboard with three sections:
- 📂 **File Management** (left)
- 🚀 **Deploy & Git** (right)

---

## Using the Dashboard

### Section 1: File Management

#### Upload PDF

1. Click **File Management** → **Upload** tab
2. Enter target folder path:
   ```
   Year_2/Sem4/Daa
   ```
3. Click "Select PDF File" and choose your PDF
4. Click "Upload PDF"

**What happens automatically:**
- ✓ PDF saved to correct folder
- ✓ Manifest regenerated
- ✓ Success message shown

#### Create Folder

1. Click **File Management** → **Create Folder** tab
2. Enter folder path:
   ```
   Year_3/Sem5/DataScience
   ```
3. Click "Create Folder"

**What happens automatically:**
- ✓ Folder structure created
- ✓ Manifest regenerated
- ✓ Success message shown

#### Manage Files/Folders

1. Click **File Management** → **Manage** tab
2. Browse the tree to find a file or folder
3. Click to select it
4. Choose action:
   - **Rename** - enter new name and confirm
   - **Delete** - confirm deletion (cannot undo!)

**What happens automatically:**
- ✓ File/folder modified
- ✓ Manifest regenerated
- ✓ Success message shown

---

### Section 2: Deploy & Git

#### Check Git Status

1. Click **Deploy & Git** → **Status** tab
2. Click "Refresh Status"
3. See modified/created/deleted files

**Example output:**
```
Modified:
M  website/folder_manifest.json
M  BTech_CSE/Year_2/Sem4/Daa/new_paper.pdf

Created:
A  admin/server.js
```

#### Commit Changes

1. Click **Deploy & Git** → **Commit** tab
2. Write a commit message:
   ```
   Add Q1 2025 previous year papers
   ```
3. Click "Commit" (local only) OR "Commit & Push" (deploy immediately)

**What happens:**
- ✓ Changes committed locally
- ✓ If pushed: automatically deployed to GitHub Pages (~30 sec)

#### Regenerate Manifest

1. Click **Deploy & Git** → **Manifest** tab
2. Click "Regenerate Manifest"

Usually not needed (happens automatically after uploads), but useful if manifest gets out of sync.

---

## Common Workflows

### Workflow 1: Add a Single Subject

```
1. Create Folder: Year_2/Sem4/NewSubject
   (or use existing folder)

2. Upload PDFs:
   - paper1.pdf → Year_2/Sem4/NewSubject
   - paper2.pdf → Year_2/Sem4/NewSubject
   - paper3.pdf → Year_2/Sem4/NewSubject

3. Commit & Push:
   Message: "Add NewSubject papers"
   Click: Commit & Push

✓ Done! GitHub Pages updates automatically
```

### Workflow 2: Bulk Upload (Many PDFs)

```
1. Create folder structure manually in BTech_CSE/ (outside dashboard)
   or via "Create Folder" in dashboard

2. Upload PDFs one by one:
   - For each PDF, go to Upload tab
   - Select PDF and target folder
   - Click Upload

3. After all uploads, go to Commit tab:
   Message: "Add 50 new papers - Sem 3"
   Click: Commit & Push

✓ Done! All manifests regenerated, deployed
```

### Workflow 3: Organize/Rename Folders

```
1. Go to Manage tab

2. Click folder you want to rename

3. Click "Rename" button

4. Enter new name, confirm

5. Commit & Push:
   Message: "Reorganize Sem 3 subjects"
   Click: Commit & Push

✓ Done! Structure updated everywhere
```

---

## Troubleshooting

### "Admin dashboard is localhost-only"

**Problem:** You're accessing from a different machine's IP address

**Solution:** 
- Use `http://localhost:3000` (same machine only)
- Not `http://192.168.1.10:3000` (fails by design)
- Not accessible remotely for security

### "Port 3000 already in use"

**Problem:** Another application is using port 3000

**Solutions:**
1. Kill the existing process:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <pid> /F
   
   # Mac/Linux
   lsof -i :3000
   kill -9 <pid>
   ```

2. Change the PORT in `admin/server.js`:
   ```javascript
   const PORT = 3001;  // Use different port
   ```

### "Manifest generation failed"

**Problem:** `generate_manifest.py` failed to run

**Check:**
1. Python is installed: `python --version`
2. `generate_manifest.py` exists in root directory
3. Check server console for error messages

### "Git operations fail"

**Problem:** Git commit/push fails

**Check:**
1. You're in a git repository: `git status`
2. Git is configured: `git config user.name` and `git config user.email`
3. You have commit rights to the repository

### Dashboard won't start

**Problem:** Server crashes or won't start

**Solutions:**
1. Clear node_modules and reinstall:
   ```bash
   cd admin
   rm -r node_modules package-lock.json
   npm install
   npm start
   ```

2. Check Node.js version:
   ```bash
   node --version  # Should be 14 or higher
   ```

3. Check console output for specific errors

---

## Security Notes

✅ **Secure by design:**
- Localhost-only (rejects remote connections)
- Path validation (prevents directory traversal)
- PDF-only uploads (no executable files)
- No authentication needed (assumes secure network)

⚠️ **Important:**
- This admin dashboard should ONLY run on your development machine
- Do NOT expose port 3000 to the internet
- Do NOT use on shared/public networks without authentication

---

## Advanced: Run with Auto-Reload

For development (automatically restarts on file changes):

```bash
cd admin
npm run dev
```

Requires `nodemon`:
```bash
npm install --save-dev nodemon
```

---

## API Endpoints (For Developers)

All endpoints return JSON and require localhost connection.

### File Operations
- `GET /api/structure` - Get folder tree
- `POST /api/upload` - Upload PDF
- `POST /api/create-folder` - Create folder
- `POST /api/rename` - Rename file/folder  
- `DELETE /api/delete` - Delete file/folder

### Git Operations
- `POST /api/git/status` - Get status
- `POST /api/git/commit` - Commit changes
- `POST /api/git/push` - Push to remote
- `POST /api/git/commit-and-push` - Commit + Push

### Manifest
- `POST /api/regenerate-manifest` - Regenerate manifest

See [admin/server.js](../admin/server.js) for implementation details.

---

## Next Steps

1. ✅ Install Node.js if not already done
2. ✅ Run `start_admin.bat` (Windows) or `bash start_admin.sh` (Mac/Linux)
3. ✅ Open http://localhost:3000
4. ✅ Try uploading a test PDF
5. ✅ Deploy to GitHub

**That's it! You now have a complete admin system.**

For architecture details, see [docs/ARCHITECTURE.md](ARCHITECTURE.md).
