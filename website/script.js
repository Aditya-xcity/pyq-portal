// ========================================
// XVELOCITY DASHBOARD SCRIPT
// ========================================

let folderManifest = null;
let currentPath = [];
let currentPDF = null;

const PDF_BASE_PATH = '/pyq-portal/BTech_CSE/';

const SECTION_KEYWORDS = {
    pyq: { keyword: 'year', title: 'Previous Year Questions' },
    notes: { keyword: 'note', title: 'Study Notes' },
    assignments: { keyword: 'assignment', title: 'Assignments' },
    books: { keyword: 'book', title: 'Reference Books' },
    lab: { keyword: 'lab', title: 'Lab Manuals' }
};

document.addEventListener('DOMContentLoaded', function () {
    initializeHeaderMenu();
    initializeSidebar();
    initializeTheme();
    initializeAccessibility();

    loadFolderManifest();

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closePDFViewer();
            closeSidebar();
        }
    });

    window.addEventListener('scroll', function () {
        const dropdownMenu = document.getElementById('dropdownMenu');
        if (dropdownMenu) {
            dropdownMenu.classList.remove('active');
        }
    });

    document.documentElement.style.scrollBehavior = 'smooth';
});

function initializeHeaderMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (!menuBtn || !dropdownMenu) return;

    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = dropdownMenu.classList.toggle('active');
        menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function () {
            if (sidebar && sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    const navLinks = document.querySelectorAll('.sidebar-link[data-nav]');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            const key = this.getAttribute('data-nav');
            if (key && key !== 'theme') {
                setActiveSidebarLink(key);
            }
            closeSidebar();
        });
    });
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('visible');
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('visible');
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
}

function setActiveSidebarLink(key) {
    const links = document.querySelectorAll('.sidebar-link[data-nav]');
    links.forEach(function (link) {
        if (link.getAttribute('data-nav') === key) link.classList.add('active');
        else link.classList.remove('active');
    });
}

function initializeTheme() {
    initTheme();

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            toggleTheme();
            setActiveSidebarLink('theme');
        });
    }
}

function initializeAccessibility() {
    const clickableCards = document.querySelectorAll('.folder-card');
    clickableCards.forEach(function (card) {
        if (!card.hasAttribute('tabindex')) {
            card.setAttribute('tabindex', '0');
        }
        card.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

async function loadFolderManifest() {
    try {
        if (window.__PYQ_FOLDER_MANIFEST__) {
            folderManifest = window.__PYQ_FOLDER_MANIFEST__;
            showWelcomeMessage();
            return;
        }

        const response = await fetch('folder_manifest.json');
        if (!response.ok) {
            throw new Error('Manifest not found. Please run generate_manifest.py');
        }

        folderManifest = await response.json();
        showWelcomeMessage();
    } catch (error) {
        console.error('Error loading manifest:', error);
        showError('Could not load folder structure. Please run generate_manifest.py to generate the manifest.');
    }
}

function navigateToFolder(pathArray) {
    const contentSection = document.getElementById('contentSection');
    if (contentSection) {
        contentSection.style.opacity = '0.55';
        contentSection.style.transform = 'translateY(2px)';
    }

    currentPath = pathArray;

    requestAnimationFrame(function () {
        renderCurrentFolder();

        if (contentSection) {
            setTimeout(function () {
                contentSection.style.opacity = '1';
                contentSection.style.transform = 'translateY(0)';
            }, 60);
        }
    });

    if (currentPath.length && /^Year_\d+$/.test(currentPath[0])) {
        const yearNum = currentPath[0].split('_')[1];
        setActiveSidebarLink('year' + yearNum);
    }
}

function navigateToPath(encodedPath) {
    try {
        const pathArray = JSON.parse(decodeURIComponent(encodedPath));
        navigateToFolder(pathArray);
    } catch (error) {
        console.error('Navigation error:', error);
    }
}

function getFolderAtPath(pathArray) {
    if (!folderManifest || !folderManifest.structure) return null;

    let current = folderManifest.structure;
    for (const segment of pathArray) {
        if (!current.children) return null;
        const child = current.children.find(function (item) {
            return item.type === 'folder' && item.name === segment;
        });
        if (!child) return null;
        current = child;
    }

    return current;
}

function renderCurrentFolder() {
    const contentSection = document.getElementById('contentSection');
    if (!contentSection) return;

    const folder = getFolderAtPath(currentPath);
    if (!folder) {
        showError('Folder not found');
        return;
    }

    let html = '';
    html += renderBreadcrumb();
    html += `<h2 style="color:#00d6ff; margin-bottom: 10px;">📁 ${escapeHtml(folder.name)}</h2>`;

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

        const sortedChildren = [...folder.children].sort(function (a, b) {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });

        sortedChildren.forEach(function (item) {
            if (item.type === 'folder') html += renderFolderItem(item);
            else html += renderFileItem(item);
        });

        html += '</div>';
    }

    contentSection.innerHTML = html;
}

function renderBreadcrumb() {
    let html = '<div class="breadcrumb">';
    html += '<span class="breadcrumb-item clickable" onclick="goHome()">🏠 Home</span>';

    currentPath.forEach(function (segment, index) {
        html += '<span class="breadcrumb-sep">/</span>';

        if (index === currentPath.length - 1) {
            html += `<span class="breadcrumb-item current">${escapeHtml(segment)}</span>`;
        } else {
            const pathToHere = currentPath.slice(0, index + 1);
            const pathStr = encodeURIComponent(JSON.stringify(pathToHere));
            html += `<span class="breadcrumb-item clickable" onclick="navigateToPath('${pathStr}')">${escapeHtml(segment)}</span>`;
        }
    });

    html += '</div>';
    return html;
}

function renderFolderItem(folder) {
    const childCount = folder.children ? folder.children.length : 0;
    const folderCount = folder.children ? folder.children.filter(function (item) { return item.type === 'folder'; }).length : 0;
    const fileCount = childCount - folderCount;

    let subtitle = 'Empty';
    if (folderCount > 0 && fileCount > 0) subtitle = `${folderCount} folders, ${fileCount} files`;
    else if (folderCount > 0) subtitle = `${folderCount} folders`;
    else if (fileCount > 0) subtitle = `${fileCount} files`;

    const newPath = [...currentPath, folder.name];
    const pathStr = encodeURIComponent(JSON.stringify(newPath));

    return `
        <div class="folder-item" onclick="navigateToPath('${pathStr}')">
            <div class="item-icon folder-icon-large">📁</div>
            <div class="item-info">
                <h4>${escapeHtml(folder.name)}</h4>
                <p>${subtitle}</p>
            </div>
        </div>
    `;
}

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
            <p>Use the left sidebar to jump across years, PYQs, notes, and documents.</p>
            ${statsHtml}
            <p class="sync-note">📡 Auto-synced with BTech_CSE folder</p>
        </div>
    `;

    setActiveSidebarLink('home');
}

function showError(message) {
    const contentSection = document.getElementById('contentSection');
    if (!contentSection) return;

    contentSection.innerHTML = `
        <div class="error-message">
            <div class="error-icon">⚠️</div>
            <h2>Error</h2>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function showSection(section) {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.classList.remove('active');
    }

    if (!SECTION_KEYWORDS[section]) {
        showWelcomeMessage();
        setActiveSidebarLink('home');
        return;
    }

    setActiveSidebarLink(section);
    showFilteredContent(SECTION_KEYWORDS[section].keyword, SECTION_KEYWORDS[section].title);
}

function showFilteredContent(keyword, title) {
    if (!folderManifest) {
        showError('Manifest not loaded');
        return;
    }

    const contentSection = document.getElementById('contentSection');
    if (!contentSection) return;

    const results = searchInStructure(folderManifest.structure, keyword.toLowerCase());
    let html = `<h2 style="color:#00d6ff; margin-bottom: 12px;">📚 ${escapeHtml(title)}</h2>`;

    if (results.length === 0) {
        html += `
            <div class="empty-folder">
                <div class="empty-icon">🔍</div>
                <p>No ${escapeHtml(title.toLowerCase())} found</p>
                <p class="empty-hint">Add files with "${escapeHtml(keyword)}" in their name or folder path.</p>
            </div>
        `;
    } else {
        html += '<div class="folder-grid">';

        results.forEach(function (item) {
            if (item.type === 'folder') html += renderSearchFolderItem(item);
            else html += renderSearchFileItem(item);
        });

        html += '</div>';
    }

    contentSection.innerHTML = html;
}

function searchInStructure(node, keyword, results = [], path = []) {
    if (node.name && node.name.toLowerCase().includes(keyword)) {
        results.push({ ...node, fullPath: [...path, node.name] });
    }

    if (node.children) {
        node.children.forEach(function (child) {
            searchInStructure(child, keyword, results, [...path, node.name]);
        });
    }

    return results;
}

function renderSearchFolderItem(folder) {
    const visiblePath = folder.fullPath.slice(1).join(' > ');
    const encodedPath = encodeURIComponent(JSON.stringify(folder.fullPath.slice(1)));

    return `
        <div class="folder-item" onclick="navigateToPath('${encodedPath}')">
            <div class="item-icon folder-icon-large">📁</div>
            <div class="item-info">
                <h4>${escapeHtml(folder.name)}</h4>
                <p class="path-hint">${escapeHtml(visiblePath)}</p>
            </div>
        </div>
    `;
}

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
                    <p class="path-hint">${escapeHtml(pathStr)}</p>
                </div>
            </div>
            <div class="file-actions">
                ${isPDF ? `<button class="view-btn" onclick="event.stopPropagation(); openPDF('${encodedPath}', '${encodedName}')">👁️ View</button>` : ''}
                <button class="download-btn" onclick="event.stopPropagation(); downloadPDF('${encodedPath}', '${encodedName}')">📥 Download</button>
            </div>
        </div>
    `;
}

function selectYear(year) {
    navigateToFolder([`Year_${year}`]);
    setActiveSidebarLink(`year${year}`);
}

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

function goHome() {
    currentPath = [];
    showWelcomeMessage();
    setActiveSidebarLink('home');

    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.classList.remove('active');
    }

    closeSidebar();
}

function openPDF(encodedPath, encodedName) {
    const path = decodeURIComponent(encodedPath);
    const name = decodeURIComponent(encodedName);
    openPDFViewer(path, name);
}

function downloadPDF(encodedPath, encodedName) {
    const path = decodeURIComponent(encodedPath);
    const name = decodeURIComponent(encodedName);
    downloadFile(name, path);
}

function openPDFViewer(pdfPath, pdfName) {
    const modal = document.getElementById('pdfModal');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfTitle = document.getElementById('pdfTitle');

    if (!modal || !pdfViewer || !pdfTitle) return;

    const encodedPath = pdfPath.split('/').map(encodeURIComponent).join('/');
    pdfViewer.src = encodedPath;
    pdfTitle.textContent = pdfName;
    currentPDF = { path: pdfPath, name: pdfName };

    if (typeof modal.showModal === 'function') {
        modal.showModal();
    } else {
        modal.style.display = 'block';
    }

    document.body.style.overflow = 'hidden';
}

function openPDFInNewTab() {
    if (!currentPDF) return;

    const encodedPath = currentPDF.path.split('/').map(encodeURIComponent).join('/');
    window.open(encodedPath, '_blank');
    showNotification('Opening PDF in new tab...');
}

function closePDFViewer() {
    const modal = document.getElementById('pdfModal');
    const pdfViewer = document.getElementById('pdfViewer');

    if (!modal || !pdfViewer) return;

    pdfViewer.src = '';
    currentPDF = null;

    if (typeof modal.close === 'function' && modal.hasAttribute('open')) {
        modal.close();
    } else {
        modal.style.display = 'none';
    }

    document.body.style.overflow = 'auto';
}

function downloadCurrentPDF() {
    if (!currentPDF) return;
    downloadFile(currentPDF.name, currentPDF.path);
}

function downloadFile(fileName, filePath) {
    const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
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
    notification.textContent = message;
    notification.style.cssText = [
        'position: fixed',
        'bottom: 16px',
        'right: 16px',
        'z-index: 2500',
        'background: linear-gradient(135deg, #00d6ff, #2b7bff)',
        'color: #031422',
        'font-weight: 700',
        'padding: 12px 16px',
        'border-radius: 10px',
        'box-shadow: 0 12px 24px rgba(0, 214, 255, 0.35)',
        'animation: xveloSlideIn .25s ease'
    ].join(';');

    document.body.appendChild(notification);

    setTimeout(function () {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(8px)';
        notification.style.transition = 'all 0.2s ease';

        setTimeout(function () {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 220);
    }, 1800);
}

window.addEventListener('click', function (event) {
    const modal = document.getElementById('pdfModal');
    if (!modal) return;

    if (event.target === modal) {
        closePDFViewer();
    }
});

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

    return icons[(extension || '').toLowerCase()] || '📄';
}

function formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function applyThemeClass(isLight) {
    if (isLight) document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
}

function setTheme(theme) {
    const normalizedTheme = theme === 'light' ? 'light' : 'dark';
    applyThemeClass(normalizedTheme === 'light');
    localStorage.setItem('siteTheme', normalizedTheme);
    updateThemeToggleUI();
}

function initTheme() {
    const savedTheme = localStorage.getItem('siteTheme');
    if (savedTheme) {
        setTheme(savedTheme);
        return;
    }

    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(prefersLight ? 'light' : 'dark');
}

function toggleTheme() {
    const isLight = document.body.classList.contains('light-theme');
    setTheme(isLight ? 'dark' : 'light');
}

function updateThemeToggleUI() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const isLight = document.body.classList.contains('light-theme');
    themeToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    themeToggle.textContent = isLight ? '⚙ Light Theme' : '⚙ Dark Theme';
}

const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = `
@keyframes xveloSlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(enhancedStyle);
