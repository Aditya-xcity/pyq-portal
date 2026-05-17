const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { spawn } = require('child_process');
const { simpleGit } = require('simple-git');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Security: localhost-only
app.use((req, res, next) => {
  const host = req.get('host');
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    return res.status(403).json({ error: 'Admin dashboard is localhost-only' });
  }
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../BTech_CSE'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExt = ['.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.includes(ext)) {
      cb(new Error('Only PDF files allowed'));
    } else {
      cb(null, true);
    }
  }
});

const git = simpleGit(path.join(__dirname, '..'));

// ====== API ENDPOINTS ======

/**
 * GET /api/structure
 * Return current folder structure
 */
app.get('/api/structure', async (req, res) => {
  try {
    const structure = await buildStructure(path.join(__dirname, '../BTech_CSE'));
    res.json(structure);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/upload
 * Upload PDF to specified folder
 */
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { path: targetPath } = req.body;
    if (!targetPath) {
      return res.status(400).json({ error: 'Target path required' });
    }

    // Ensure path is within BTech_CSE
    const fullPath = path.join(__dirname, '../BTech_CSE', targetPath, req.file.filename);
    const resolvedPath = path.resolve(fullPath);
    const basePath = path.resolve(path.join(__dirname, '../BTech_CSE'));

    if (!resolvedPath.startsWith(basePath)) {
      await fs.unlink(req.file.path);
      return res.status(403).json({ error: 'Invalid path' });
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(resolvedPath), { recursive: true });

    // Move file
    await fs.rename(req.file.path, resolvedPath);

    // Regenerate manifest
    await regenerateManifest();

    res.json({ 
      success: true, 
      message: `Uploaded ${req.file.filename}`,
      file: req.file.filename 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/create-folder
 * Create new folder in structure
 */
app.post('/api/create-folder', express.json(), async (req, res) => {
  try {
    const { path: folderPath } = req.body;
    if (!folderPath) {
      return res.status(400).json({ error: 'Folder path required' });
    }

    const fullPath = path.join(__dirname, '../BTech_CSE', folderPath);
    const resolvedPath = path.resolve(fullPath);
    const basePath = path.resolve(path.join(__dirname, '../BTech_CSE'));

    if (!resolvedPath.startsWith(basePath)) {
      return res.status(403).json({ error: 'Invalid path' });
    }

    await fs.mkdir(resolvedPath, { recursive: true });

    // Regenerate manifest
    await regenerateManifest();

    res.json({ 
      success: true, 
      message: `Created folder: ${folderPath}` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/rename
 * Rename file or folder
 */
app.post('/api/rename', express.json(), async (req, res) => {
  try {
    const { oldPath, newName } = req.body;
    if (!oldPath || !newName) {
      return res.status(400).json({ error: 'oldPath and newName required' });
    }

    const oldFullPath = path.join(__dirname, '../BTech_CSE', oldPath);
    const parentDir = path.dirname(oldFullPath);
    const newFullPath = path.join(parentDir, newName);

    const oldResolved = path.resolve(oldFullPath);
    const newResolved = path.resolve(newFullPath);
    const basePath = path.resolve(path.join(__dirname, '../BTech_CSE'));

    if (!oldResolved.startsWith(basePath) || !newResolved.startsWith(basePath)) {
      return res.status(403).json({ error: 'Invalid path' });
    }

    await fs.rename(oldFullPath, newFullPath);

    // Regenerate manifest
    await regenerateManifest();

    res.json({ 
      success: true, 
      message: `Renamed to ${newName}` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/delete
 * Delete file or folder
 */
app.delete('/api/delete', express.json(), async (req, res) => {
  try {
    const { path: itemPath } = req.body;
    if (!itemPath) {
      return res.status(400).json({ error: 'Path required' });
    }

    const fullPath = path.join(__dirname, '../BTech_CSE', itemPath);
    const resolvedPath = path.resolve(fullPath);
    const basePath = path.resolve(path.join(__dirname, '../BTech_CSE'));

    if (!resolvedPath.startsWith(basePath)) {
      return res.status(403).json({ error: 'Invalid path' });
    }

    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      await fs.rm(fullPath, { recursive: true, force: true });
    } else {
      await fs.unlink(fullPath);
    }

    // Regenerate manifest
    await regenerateManifest();

    res.json({ 
      success: true, 
      message: `Deleted ${itemPath}` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/regenerate-manifest
 * Manually trigger manifest regeneration
 */
app.post('/api/regenerate-manifest', async (req, res) => {
  try {
    await regenerateManifest();
    res.json({ success: true, message: 'Manifest regenerated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/git/status
 * Get git status
 */
app.post('/api/git/status', async (req, res) => {
  try {
    const status = await git.status();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/git/commit
 * Commit changes
 */
app.post('/api/git/commit', express.json(), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Commit message required' });
    }

    await git.add('.');
    const commitResult = await git.commit(message);

    res.json({ 
      success: true, 
      message: 'Changes committed',
      commit: commitResult.commit 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/git/push
 * Push to remote
 */
app.post('/api/git/push', express.json(), async (req, res) => {
  try {
    const pushResult = await git.push();
    res.json({ 
      success: true, 
      message: 'Pushed to remote',
      result: pushResult 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/git/commit-and-push
 * Commit and push in one step
 */
app.post('/api/git/commit-and-push', express.json(), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Commit message required' });
    }

    await git.add('.');
    const commitResult = await git.commit(message);
    const pushResult = await git.push();

    res.json({ 
      success: true, 
      message: 'Committed and pushed',
      commit: commitResult.commit,
      push: pushResult 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== HELPER FUNCTIONS ======

/**
 * Recursively build folder structure object
 */
async function buildStructure(dir) {
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    const structure = {
      folders: [],
      files: []
    };

    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      const relativePath = path.relative(
        path.join(__dirname, '../BTech_CSE'),
        itemPath
      );

      if (item.isDirectory()) {
        structure.folders.push({
          name: item.name,
          path: relativePath,
          children: await buildStructure(itemPath)
        });
      } else if (item.name.endsWith('.pdf')) {
        structure.files.push({
          name: item.name,
          path: relativePath,
          size: (await fs.stat(itemPath)).size
        });
      }
    }

    return structure;
  } catch (err) {
    console.error('Error building structure:', err);
    return { folders: [], files: [] };
  }
}

/**
 * Regenerate manifest by running generate_manifest.py
 */
async function regenerateManifest() {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../generate_manifest.py');
    const pythonProcess = spawn('python', [pythonScript], {
      cwd: path.join(__dirname, '..')
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Manifest generation failed with code ${code}`));
      } else {
        resolve();
      }
    });

    pythonProcess.on('error', reject);
  });
}

// ====== START SERVER ======

app.listen(PORT, 'localhost', () => {
  console.log(`\n✓ Admin dashboard running at http://localhost:${PORT}`);
  console.log('✓ Localhost-only (security)\n');
});
