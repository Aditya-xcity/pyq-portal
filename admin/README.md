# PYQ Portal Admin Dashboard

Complete admin system for managing PDFs, folders, and deploying changes to GitHub Pages.

## Features

- 📤 **PDF Upload** - Upload PDFs to any folder in the structure
- 📁 **Folder Management** - Create, rename, and delete folders
- 🔄 **Auto-Regeneration** - Automatically regenerates `folder_manifest.json` after changes
- 🚀 **Git Integration** - Commit and push changes directly from the dashboard
- 🔒 **Localhost-Only** - Secure by default, only accessible from localhost
- 💻 **Beautiful UI** - Modern, responsive admin interface

## Setup

### Prerequisites

- Node.js 14+
- Git
- Python 3.x (for manifest generation)

### Installation

1. Navigate to admin folder:
```bash
cd admin
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open browser:
```
http://localhost:3000
```

## Usage

### Upload PDFs

1. Go to **File Management** → **Upload** tab
2. Enter target folder path (e.g., `Year_2/Sem4/Daa`)
3. Select PDF file
4. Click "Upload PDF"
5. Manifest regenerates automatically ✓

### Create Folders

1. Go to **File Management** → **Create Folder** tab
2. Enter folder path (e.g., `Year_3/Sem5/DataScience`)
3. Click "Create Folder"
4. Manifest regenerates automatically ✓

### Manage Files/Folders

1. Go to **File Management** → **Manage** tab
2. Browse and click to select a file or folder
3. Click "Rename" or "Delete"
4. Confirm changes

### Deploy to GitHub

1. Go to **Deploy & Git** → **Status** tab
2. Click "Refresh Status" to see changed files
3. Go to **Commit** tab
4. Write commit message
5. Click "Commit & Push" to deploy
6. GitHub Pages updates automatically ✓

### Regenerate Manifest

If needed:
1. Go to **Deploy & Git** → **Manifest** tab
2. Click "Regenerate Manifest"
3. Useful if manifest gets out of sync

## API Endpoints

All endpoints require localhost connection.

### File Operations

- `GET /api/structure` - Get folder structure
- `POST /api/upload` - Upload PDF
- `POST /api/create-folder` - Create folder
- `POST /api/rename` - Rename file/folder
- `DELETE /api/delete` - Delete file/folder
- `POST /api/regenerate-manifest` - Regenerate manifest

### Git Operations

- `POST /api/git/status` - Get git status
- `POST /api/git/commit` - Commit changes
- `POST /api/git/push` - Push to remote
- `POST /api/git/commit-and-push` - Commit and push

## Architecture

```
admin/
├── server.js           # Express backend with all APIs
├── public/
│   └── index.html      # Admin dashboard UI
├── package.json        # Dependencies
└── README.md           # This file
```

The admin system:
1. Serves the dashboard at `localhost:3000`
2. Handles file uploads and folder operations
3. Validates all paths (security)
4. Auto-regenerates manifest via Python
5. Manages git commits and pushes
6. Returns JSON responses for all operations

## Security

- ✓ **Localhost-only** - Rejects non-localhost requests
- ✓ **Path validation** - Prevents access outside BTech_CSE/
- ✓ **PDF-only uploads** - No other file types allowed
- ✓ **No authentication needed** - Assumes secure network

## Development

To run with auto-reload:

```bash
npm run dev
```

This uses `nodemon` to restart on file changes.

## Troubleshooting

### "Admin dashboard is localhost-only"
Make sure you're accessing via `localhost:3000` or `127.0.0.1:3000`, not the machine IP address.

### "Manifest generation failed"
Check that `generate_manifest.py` exists in the root directory and is executable.

### Git operations fail
Make sure you're in a git repository and have valid credentials configured.

### Port 3000 already in use
Change the PORT in server.js or kill the process using port 3000.

## Next Steps

- Test the dashboard locally
- Push `admin/` folder to GitHub
- Try uploading a PDF and deploying
- Monitor GitHub Pages deployment

## License

MIT
