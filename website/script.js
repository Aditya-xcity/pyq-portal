// Toggle menu dropdown and initialize
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }
    
    // Load folder manifest and initialize
    loadFolderManifest();
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePDFViewer();
        }
    });
});

// Global state
let folderManifest = null;
let currentPath = [];
let currentPDF = null;

// Base path for PDFs (absolute path for GitHub Pages deployment)
const PDF_BASE_PATH = "/pyq-portal/BTech_CSE/";

// Load folder manifest from JSON
async function loadFolderManifest() {
    try {
        const response = await fetch('folder_manifest.json');
        if (!response.ok) {
            throw new Error('Manifest not found. Please run generate_manifest.py');
        }
        folderManifest = await response.json();
        console.log('Manifest loaded:', folderManifest.stats);
        
        // Show welcome message with stats
        showWelcomeMessage();
        
        // Initialize year folders footer
        initializeYearFolders();
    } catch (error) {
        console.error('Error loading manifest:', error);
        showError('Could not load folder structure. Please run generate_manifest.py to generate the manifest.');
    }
}

// Initialize the year folder cards in footer based on manifest
function initializeYearFolders() {
    if (!folderManifest || !folderManifest.structure) return;
    
    const foldersGrid = document.querySelector('.folders-grid');
    if (!foldersGrid) return;
    
    // Clear existing folders
    foldersGrid.innerHTML = '';
    
    // Get year folders from manifest
    const yearFolders = folderManifest.structure.children.filter(child => 
        child.type === 'folder' && child.name.toLowerCase().includes('year')
    );
    
    if (yearFolders.length === 0) {
        // Fallback: show all root folders
        folderManifest.structure.children
            .filter(child => child.type === 'folder')
            .forEach(folder => {
                const card = createFolderCard(folder, folder.name);
                foldersGrid.appendChild(card);
            });
    } else {
        // Show year folders
        yearFolders.forEach((folder, index) => {
            const yearNum = index + 1;
            const ordinal = getOrdinal(yearNum);
            const card = createFolderCard(folder, `${ordinal} YEAR`, `Year ${yearNum}`);
            foldersGrid.appendChild(card);
        });
    }
}

// Create a folder card element for the footer
function createFolderCard(folder, title, subtitle) {
    const card = document.createElement('div');
    card.className = 'folder-card';
    card.onclick = () => navigateToFolder([folder.name]);
    
    // Count subfolders
    const subfolderCount = folder.children ? folder.children.filter(c => c.type === 'folder').length : 0;
    const fileCount = folder.children ? folder.children.filter(c => c.type === 'file').length : 0;
    
    let subtitleText = subtitle || '';
    if (!subtitle) {
        const parts = [];
        if (subfolderCount > 0) parts.push(`${subfolderCount} folders`);
        if (fileCount > 0) parts.push(`${fileCount} files`);
        subtitleText = parts.join(', ') || 'Empty';
    }
    
    card.innerHTML = `
        <div class="folder-icon">📁</div>
        <h4>${title}</h4>
        <p>${subtitleText}</p>
    `;
    
    return card;
}

// Get ordinal suffix for a number
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Navigate to a specific folder path
function navigateToFolder(pathArray) {
    console.log('Navigating to folder:', pathArray);
    currentPath = pathArray;
    renderCurrentFolder();
}

// Go back one level
function goBack() {
    if (currentPath.length > 0) {
        currentPath.pop();
        if (currentPath.length === 0) {
            showWelcomeMessage();
        } else {
            renderCurrentFolder();
        }
    } else {
        showWelcomeMessage();
    }
}

// Go to root
function goHome() {
    currentPath = [];
    showWelcomeMessage();
    
    // Close dropdown menu if open
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.classList.remove('active');
    }
}

// Get folder at current path
function getFolderAtPath(pathArray) {
    if (!folderManifest || !folderManifest.structure) return null;
    
    let current = folderManifest.structure;
    
    for (const segment of pathArray) {
        if (!current.children) return null;
        const child = current.children.find(c => c.name === segment && c.type === 'folder');
        if (!child) return null;
        current = child;
    }
    
    return current;
}

// Render the current folder content
function renderCurrentFolder() {
    const contentSection = document.getElementById('contentSection');
    if (!contentSection) return;
    
    const folder = getFolderAtPath(currentPath);
    if (!folder) {
        showError('Folder not found');
        return;
    }
    
    let html = '';
    
    // Breadcrumb navigation
    html += renderBreadcrumb();
    
    // Folder title
    html += `<h2 style="color: #00f3ff; margin-bottom: 20px;">📁 ${folder.name}</h2>`;
    
    // Check if folder has any content
    if (!folder.children || folder.children.length === 0) {
        html += `
            <div class="empty-folder">
                <div class="empty-icon">📂</div>
                <p>This folder is empty</p>
                <p class="empty-hint">Add files to: BTech_CSE/${currentPath.join('/')}</p>
            </div>
        `;
    } else {
        html += '<div class="folder-grid">';
        
        // Sort: folders first, then files
        const sortedChildren = [...folder.children].sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
        
        sortedChildren.forEach(item => {
            if (item.type === 'folder') {
                html += renderFolderItem(item);
            } else {
                html += renderFileItem(item);
            }
        });
        
        html += '</div>';
    }
    
    contentSection.innerHTML = html;
}

// Render breadcrumb navigation
function renderBreadcrumb() {
    let html = '<div class="breadcrumb">';
    html += `<span class="breadcrumb-item clickable" onclick="goHome()">🏠 Home</span>`;
    
    currentPath.forEach((segment, index) => {
        html += ` <span class="breadcrumb-sep">/</span> `;
        if (index === currentPath.length - 1) {
            html += `<span class="breadcrumb-item current">${segment}</span>`;
        } else {
            const pathToHere = currentPath.slice(0, index + 1);
            const pathStr = encodeURIComponent(JSON.stringify(pathToHere));
            html += `<span class="breadcrumb-item clickable" onclick="navigateToPath('${pathStr}')">${segment}</span>`;
        }
    });
    
    html += '</div>';
    return html;
}

// Helper function to navigate using encoded path string
function navigateToPath(encodedPath) {
    try {
        const pathArray = JSON.parse(decodeURIComponent(encodedPath));
        navigateToFolder(pathArray);
    } catch (e) {
        console.error('Navigation error:', e);
    }
}

// Render a folder item
function renderFolderItem(folder) {
    const childCount = folder.children ? folder.children.length : 0;
    const folderCount = folder.children ? folder.children.filter(c => c.type === 'folder').length : 0;
    const fileCount = childCount - folderCount;
    
    let subtitle = '';
    if (folderCount > 0 && fileCount > 0) {
        subtitle = `${folderCount} folders, ${fileCount} files`;
    } else if (folderCount > 0) {
        subtitle = `${folderCount} folders`;
    } else if (fileCount > 0) {
        subtitle = `${fileCount} files`;
    } else {
        subtitle = 'Empty';
    }
    
    const newPath = [...currentPath, folder.name];
    const pathStr = encodeURIComponent(JSON.stringify(newPath));
    
    return `
        <div class="folder-item" onclick="navigateToPath('${pathStr}')">
            <div class="item-icon folder-icon-large">📁</div>
            <div class="item-info">
                <h4>${folder.name}</h4>
                <p>${subtitle}</p>
            </div>
        </div>
    `;
}

// Render a file item
function renderFileItem(file) {
    const isPDF = file.extension && file.extension.toLowerCase() === '.pdf';
    const icon = isPDF ? '📄' : getFileIcon(file.extension);
    const sizeStr = file.size_mb ? `${file.size_mb} MB` : formatFileSize(file.size);
    
    const filePath = PDF_BASE_PATH + file.path;
    const encodedName = encodeURIComponent(file.name);
    const encodedPath = encodeURIComponent(filePath);
    
    return `
        <div class="file-item">
            <div class="file-item-header">
                <div class="file-icon">${icon}</div>
                <div class="item-info">
                    <h4>${escapeHtml(file.name)}</h4>
                    <p>${sizeStr}</p>
                </div>
            </div>
            <div class="file-actions">
                ${isPDF ? `<button class="view-btn" onclick="event.stopPropagation(); openPDF('${encodedPath}', '${encodedName}')">👁️ View</button>` : ''}
                <button class="download-btn" onclick="event.stopPropagation(); downloadPDF('${encodedPath}', '${encodedName}')">📥 Download</button>
            </div>
        </div>
    `;
}

// Helper to escape HTML entities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Wrapper functions for encoded paths
function openPDF(encodedPath, encodedName) {
    const path = decodeURIComponent(encodedPath);
    const name = decodeURIComponent(encodedName);
    console.log('Opening PDF:', path, name);
    openPDFViewer(path, name);
}

function downloadPDF(encodedPath, encodedName) {
    const path = decodeURIComponent(encodedPath);
    const name = decodeURIComponent(encodedName);
    console.log('Downloading PDF:', path, name);
    downloadFile(name, path);
}

// Get icon for file type
function getFileIcon(extension) {
    const icons = {
        '.pdf': '📄',
        '.doc': '📝',
        '.docx': '📝',
        '.xls': '📊',
        '.xlsx': '📊',
        '.ppt': '📽️',
        '.pptx': '📽️',
        '.jpg': '🖼️',
        '.jpeg': '🖼️',
        '.png': '🖼️',
        '.gif': '🖼️',
        '.zip': '📦',
        '.rar': '📦',
        '.txt': '📃',
        '.mp4': '🎬',
        '.mp3': '🎵'
    };
    return icons[extension?.toLowerCase()] || '📄';
}

// Format file size
function formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Show welcome message
function showWelcomeMessage() {
    const contentSection = document.getElementById('contentSection');
    if (!contentSection) return;
    
    let statsHtml = '';
    if (folderManifest && folderManifest.stats) {
        statsHtml = `
            <div class="stats-bar">
                <span>📁 ${folderManifest.stats.total_folders} Folders</span>
                <span>📄 ${folderManifest.stats.total_files} Files</span>
                <span>📋 ${folderManifest.stats.total_pdfs} PDFs</span>
            </div>
        `;
    }
    
    contentSection.innerHTML = `
        <div class="welcome-message">
            <h2>Welcome to XVelocity Study Hub</h2>
            <p>Select a year folder below or use the menu to browse materials</p>
            ${statsHtml}
            <p class="sync-note">📡 Auto-synced with BTech_CSE folder</p>
        </div>
    `;
}

// Show error message
function showError(message) {
    const contentSection = document.getElementById('contentSection');
    if (!contentSection) return;
    
    contentSection.innerHTML = `
        <div class="error-message">
            <div class="error-icon">⚠️</div>
            <h2>Error</h2>
            <p>${message}</p>
        </div>
    `;
}

// =====================
// Menu Section Handlers
// =====================

function showSection(section) {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.classList.remove('active');
    }
    
    // For now, just show the folder browser
    // You can extend this to filter specific content types
    switch(section) {
        case 'pyq':
            showFilteredContent('PYQ', 'Previous Year Questions');
            break;
        case 'notes':
            showFilteredContent('Notes', 'Study Notes');
            break;
        case 'assignments':
            showFilteredContent('Assignment', 'Assignments');
            break;
        case 'books':
            showFilteredContent('Book', 'Reference Books');
            break;
        case 'lab':
            showFilteredContent('Lab', 'Lab Manuals');
            break;
        default:
            showWelcomeMessage();
    }
}

// Show content filtered by keyword (searches in folder/file names)
function showFilteredContent(keyword, title) {
    if (!folderManifest) {
        showError('Manifest not loaded');
        return;
    }
    
    const contentSection = document.getElementById('contentSection');
    if (!contentSection) return;
    
    const results = searchInStructure(folderManifest.structure, keyword.toLowerCase());
    
    let html = `<h2 style="color: #00f3ff; margin-bottom: 20px;">📚 ${title}</h2>`;
    
    if (results.length === 0) {
        html += `
            <div class="empty-folder">
                <div class="empty-icon">🔍</div>
                <p>No ${title.toLowerCase()} found</p>
                <p class="empty-hint">Add files with "${keyword}" in their name or folder path</p>
            </div>
        `;
    } else {
        html += '<div class="folder-grid">';
        
        results.forEach(item => {
            if (item.type === 'folder') {
                html += renderSearchFolderItem(item);
            } else {
                html += renderSearchFileItem(item);
            }
        });
        
        html += '</div>';
    }
    
    contentSection.innerHTML = html;
}

// Search for items matching keyword
function searchInStructure(node, keyword, results = [], path = []) {
    if (node.name.toLowerCase().includes(keyword)) {
        results.push({ ...node, fullPath: [...path, node.name] });
    }
    
    if (node.children) {
        node.children.forEach(child => {
            searchInStructure(child, keyword, results, [...path, node.name]);
        });
    }
    
    return results;
}

// Render folder item from search results
function renderSearchFolderItem(folder) {
    const pathStr = folder.fullPath.slice(1).join(' > ');
    const encodedPath = encodeURIComponent(JSON.stringify(folder.fullPath.slice(1)));
    
    return `
        <div class="folder-item" onclick="navigateToPath('${encodedPath}')">
            <div class="item-icon folder-icon-large">📁</div>
            <div class="item-info">
                <h4>${folder.name}</h4>
                <p class="path-hint">${pathStr}</p>
            </div>
        </div>
    `;
}

// Render file item from search results
function renderSearchFileItem(file) {
    const isPDF = file.extension && file.extension.toLowerCase() === '.pdf';
    const icon = isPDF ? '📄' : getFileIcon(file.extension);
    const sizeStr = file.size_mb ? `${file.size_mb} MB` : formatFileSize(file.size);
    const pathStr = file.fullPath.slice(1, -1).join(' > ');
    
    const filePath = PDF_BASE_PATH + file.path;
    const encodedName = encodeURIComponent(file.name);
    const encodedPath = encodeURIComponent(filePath);
    
    return `
        <div class="file-item">
            <div class="file-item-header">
                <div class="file-icon">${icon}</div>
                <div class="item-info">
                    <h4>${escapeHtml(file.name)}</h4>
                    <p>${sizeStr}</p>
                    <p class="path-hint">${pathStr}</p>
                </div>
            </div>
            <div class="file-actions">
                ${isPDF ? `<button class="view-btn" onclick="event.stopPropagation(); openPDF('${encodedPath}', '${encodedName}')">👁️ View</button>` : ''}
                <button class="download-btn" onclick="event.stopPropagation(); downloadPDF('${encodedPath}', '${encodedName}')">📥 Download</button>
            </div>
        </div>
    `;
}

// Handle year selection from footer (kept for backwards compatibility)
function selectYear(year) {
    const yearName = `Year_${year}`;
    navigateToFolder([yearName]);
}

// ==================
// PDF Viewer Functions
// ==================

function openPDFViewer(pdfPath, pdfName) {
    const modal = document.getElementById('pdfModal');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfTitle = document.getElementById('pdfTitle');
    
    if (modal && pdfViewer && pdfTitle) {
        // Encode the path for URL (handles spaces and special characters)
        const encodedPath = pdfPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
        
        // For local files, try to load in iframe
        // If it fails, the user can use "Open in New Tab" or Download
        pdfViewer.src = encodedPath;
        pdfTitle.textContent = pdfName;
        currentPDF = { path: pdfPath, name: pdfName };
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        console.log('PDF Modal opened for:', encodedPath);
    } else {
        console.error('PDF Modal elements not found');
    }
}

// Open PDF in a new browser tab
function openPDFInNewTab() {
    if (currentPDF) {
        const encodedPath = currentPDF.path.split('/').map(segment => encodeURIComponent(segment)).join('/');
        window.open(encodedPath, '_blank');
    }
}

function closePDFViewer() {
    const modal = document.getElementById('pdfModal');
    const pdfViewer = document.getElementById('pdfViewer');
    
    if (modal && pdfViewer) {
        pdfViewer.src = '';
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentPDF = null;
    }
}

function downloadCurrentPDF() {
    if (currentPDF) {
        downloadFile(currentPDF.name, currentPDF.path);
    }
}

function downloadFile(fileName, filePath) {
    const encodedPath = filePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const link = document.createElement('a');
    link.href = encodedPath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Downloading: ${fileName}`);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #00f3ff;
        color: #0a0a0a;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 600;
        animation: slideIn 0.3s ease;
        z-index: 2000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('pdfModal');
    if (event.target === modal) {
        closePDFViewer();
    }
};

// Keep dropdown closed on scroll
window.addEventListener('scroll', function() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu && dropdownMenu.classList.contains('active')) {
        dropdownMenu.classList.remove('active');
    }
});

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
