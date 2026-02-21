// BTech CSE Study Materials Library - Main JavaScript

// Global variables
let currentYear = null;
let currentSemester = null;
let currentSubject = null;
let currentDocType = null;
let allPDFs = {};
let allSubjects = [];

// Data Structure
const yearStructure = {
    1: { semesters: [1, 2], subjects: 12 },
    2: { semesters: [3, 4], subjects: 12 },
    3: { semesters: [5, 6], subjects: 12 },
    4: { semesters: [7, 8], subjects: 10 }
};

const documentTypes = {
    'PYQs': { icon: '📋', color: '#e74c3c', desc: 'Previous Year Questions' },
    'Notes': { icon: '📝', color: '#3498db', desc: 'Study Notes' },
    'Assignments': { icon: '✏️', color: '#f39c12', desc: 'Assignment Sheets' },
    'Books': { icon: '📚', color: '#2ecc71', desc: 'Reference Books' },
    'Lab': { icon: '🔬', color: '#9b59b6', desc: 'Lab Materials' }
};

const semesterSubjects = {
    1: ['Mathematics-I', 'Physics-I', 'Chemistry', 'Programming', 'Graphics', 'Environmental Studies'],
    2: ['Mathematics-II', 'Physics-II', 'Data Structures', 'Web Tech', 'Circuits', 'Communication'],
    3: ['DBMS', 'Algorithms', 'OOP', 'Networking', 'Linux Admin', 'Web Dev'],
    4: ['DBMS Impl', 'Design Patterns', 'Cloud Computing', 'Mobile App', 'Web Services', 'IPR'],
    5: ['Software Engineering', 'AI', 'Machine Learning', 'NLP', 'Big Data', 'Cryptography'],
    6: ['Compiler Design', 'Operating Systems', 'Cybersecurity', 'Distributed Sys', 'Computer Vision', 'IR'],
    7: ['Project I', 'Elective 1', 'Elective 2', 'Elective 3', 'Elective 4', 'Seminar'],
    8: ['Project II', 'Internship', 'Capstone', 'Elective 5', 'Elective 6', 'General Elective']
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing BTech CSE Study Materials Library');
    loadPDFManifest();
    initializeUI();
    setupEventListeners();
});

// Load PDF Manifest
function loadPDFManifest() {
    // This would load from pdf_manifest.json
    // For now, we'll use sample data that will be generated
    fetchPDFManifest();
}

// Fetch PDF Manifest (from JSON file)
function fetchPDFManifest() {
    fetch('pdf_manifest.json')
        .then(response => response.json())
        .then(data => {
            allPDFs = data.pdfs;
            allSubjects = data.subjects;
            updateStatistics();
            console.log('PDF Manifest loaded:', allPDFs.length, 'files');
        })
        .catch(error => {
            console.log('Using demo mode - pdf_manifest.json not found');
            loadDemoData();
        });
}

// Demo Data
function loadDemoData() {
    allPDFs = {
        'Year 1': {
            'Semester 1': {
                'Subject_101': {
                    'PYQs': ['Math-I-2023-MidPaper.pdf', 'Math-I-2023-EndPaper.pdf'],
                    'Notes': ['Math-I-ClassNotes.pdf'],
                    'Assignments': [],
                    'Books': [],
                    'Lab': []
                }
            }
        }
    };
    allSubjects = generateAllSubjects();
}

// Generate all subjects list
function generateAllSubjects() {
    const subjects = [];
    for (let sem = 1; sem <= 8; sem++) {
        for (let subj = 1; subj <= (sem <= 6 ? 6 : 5); subj++) {
            const code = sem.toString() + subj.toString().padStart(2, '0');
            subjects.push({
                code: code,
                semester: sem,
                name: semesterSubjects[sem]?.[subj - 1] || `Subject ${code}`,
                year: sem <= 2 ? 1 : sem <= 4 ? 2 : sem <= 6 ? 3 : 4
            });
        }
    }
    return subjects;
}

// Initialize UI
function initializeUI() {
    populateSemesterList();
    populateSubjectView();
    updateStatistics();
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });

    // Subject search
    document.getElementById('subjectSearch').addEventListener('keyup', filterSubjects);

    // Scroll to top
    window.addEventListener('scroll', toggleScrollToTopButton);
}

// View Management
function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    document.getElementById(viewId).classList.add('active');

    // Update navbar
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.nav-btn').classList.add('active');

    // Reset breadcrumb
    updateBreadcrumb(['Home']);
}

// Year Selection
function selectYear(year) {
    currentYear = year;
    showYearDetails(year);
    updateBreadcrumb(['Home', `Year ${year}`]);
}

function showYearDetails(year) {
    const yearTitle = document.getElementById('yearTitle');
    yearTitle.textContent = `Year ${year}`;

    const container = document.getElementById('semesterCardsContainer');
    container.innerHTML = '';

    const semesters = yearStructure[year].semesters;
    semesters.forEach(sem => {
        const card = createSemesterCard(sem, year);
        container.appendChild(card);
    });

    // Hide year view and show details
    document.getElementById('yearView').classList.remove('active');
    document.getElementById('yearDetailsView').classList.add('active');
}

function createSemesterCard(semester, year) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.borderLeftColor = '#2ecc71';
    
    const subjectCount = semester <= 6 ? 6 : 5;
    card.innerHTML = `
        <h3>Semester ${semester}</h3>
        <p class="card-desc">6 Subjects</p>
        <span class="sub-count" onclick="selectSemester(${semester})">
            View Subjects →
        </span>
    `;
    card.onclick = () => selectSemester(semester);
    return card;
}

function selectSemester(semester) {
    currentSemester = semester;
    showSemesterSubjects(semester);
    updateBreadcrumb(['Home', `Year ${currentYear}`, `Semester ${semester}`]);
}

function showSemesterSubjects(semester) {
    const container = document.getElementById('semesterCardsContainer');
    container.innerHTML = '';

    const subjectCount = semester <= 6 ? 6 : 5;
    for (let i = 1; i <= subjectCount; i++) {
        const code = semester.toString() + i.toString().padStart(2, '0');
        const subjectName = semesterSubjects[semester][i - 1];
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>Subject ${code}</h3>
            <p class="card-desc">${subjectName}</p>
            <span class="sub-count">View →</span>
        `;
        card.onclick = () => selectSubject(code, semester, subjectName);
        container.appendChild(card);
    }
}

function selectSubject(code, semester, name) {
    currentSubject = { code, semester, name };
    showSubjectDetails(code, name);
    updateBreadcrumb(['Home', `Year ${currentYear}`, `Semester ${semester}`, `${name} (${code})`]);
}

function showSubjectDetails(code, name) {
    document.getElementById('subjectTitle').textContent = `${name} (Subject ${code})`;

    const container = document.getElementById('documentTypesContainer');
    container.innerHTML = '';

    Object.keys(documentTypes).forEach(type => {
        const docInfo = documentTypes[type];
        const card = document.createElement('div');
        card.className = 'doc-type-card';
        card.style.background = `linear-gradient(135deg, ${docInfo.color} 0%, ${docInfo.color}dd 100%)`;
        
        // Count documents (demo data)
        const count = Math.floor(Math.random() * 10);
        
        card.innerHTML = `
            <div class="doc-count">${count}</div>
            <h3>${type}</h3>
            <p>${docInfo.desc}</p>
        `;
        card.onclick = () => showDocuments(type, code, name);
        container.appendChild(card);
    });

    document.getElementById('yearDetailsView').classList.remove('active');
    document.getElementById('subjectDetailsView').classList.add('active');
}

function showDocuments(docType, subjectCode, subjectName) {
    currentDocType = docType;
    
    document.getElementById('documentsTitle').textContent = `${subjectName} - ${docType}`;

    const container = document.getElementById('documentsList');
    container.innerHTML = '';

    // Generate sample documents
    const sampleDocs = generateSampleDocuments(subjectCode, docType);

    if (sampleDocs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No ${docType} available yet</h3>
                <p>Check back soon for more study materials!</p>
            </div>
        `;
    } else {
        sampleDocs.forEach(doc => {
            const item = createDocumentItem(doc, subjectCode);
            container.appendChild(item);
        });
    }

    document.getElementById('subjectDetailsView').classList.remove('active');
    document.getElementById('documentsView').classList.add('active');
}

function generateSampleDocuments(subjectCode, docType) {
    const docs = [];
    const years = ['2023', '2024', '2025'];
    const count = docType === 'PYQs' ? 4 : docType === 'Books' ? 3 : 2;
    
    for (let i = 0; i < count; i++) {
        const year = years[Math.floor(Math.random() * years.length)];
        const docName = `${subjectCode}_${docType}_${year}_${i + 1}.pdf`;
        docs.push({
            name: docName,
            subject: subjectCode,
            type: docType,
            size: Math.floor(Math.random() * 5 + 1) + ' MB',
            uploaded: year
        });
    }
    
    return docs;
}

function createDocumentItem(doc, subjectCode) {
    const item = document.createElement('div');
    item.className = 'document-item';
    item.innerHTML = `
        <div class="document-info">
            <div class="document-name">📄 ${doc.name}</div>
            <div class="document-meta">Size: ${doc.size} | Uploaded: ${doc.uploaded}</div>
        </div>
        <div class="document-actions">
            <a href="https://github.com" class="btn btn-download" target="_blank" title="Download">
                ⬇️ Download
            </a>
            <button class="btn btn-secondary" onclick="viewDocument('${doc.name}')" title="View">
                👁️ View
            </button>
        </div>
    `;
    return item;
}

// Subject View
function populateSubjectView() {
    const container = document.getElementById('subjectCardsContainer');
    container.innerHTML = '';

    for (let sem = 1; sem <= 8; sem++) {
        const subjectCount = sem <= 6 ? 6 : 5;
        for (let i = 1; i <= subjectCount; i++) {
            const code = sem.toString() + i.toString().padStart(2, '0');
            const name = semesterSubjects[sem][i - 1];
            const year = sem <= 2 ? 1 : sem <= 4 ? 2 : sem <= 6 ? 3 : 4;

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>Subject ${code}</h3>
                <p class="card-desc">${name}</p>
                <span class="sub-count">Year ${year} • Sem ${sem}</span>
            `;
            card.onclick = () => {
                currentYear = year;
                currentSemester = sem;
                selectSubject(code, sem, name);
            };
            container.appendChild(card);
        }
    }
}

function populateSemesterList() {
    const container = document.getElementById('semesterListContainer');
    container.innerHTML = '';

    for (let sem = 1; sem <= 8; sem++) {
        const year = sem <= 2 ? 1 : sem <= 4 ? 2 : sem <= 6 ? 3 : 4;
        const item = document.createElement('div');
        item.className = 'semester-item';
        item.innerHTML = `
            <div>
                <h3>Semester ${sem}</h3>
                <p>Year ${year} • ${sem <= 6 ? 6 : 5} Subjects</p>
            </div>
            <span style="font-size: 1.3em;">→</span>
        `;
        item.onclick = () => {
            currentYear = year;
            selectSemester(sem);
        };
        container.appendChild(item);
    }
}

function filterSubjects() {
    const searchTerm = document.getElementById('subjectSearch').value.toLowerCase();
    const cards = document.querySelectorAll('#subjectCardsContainer .card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// Search Functionality
function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    if (!query.trim()) {
        resultsContainer.innerHTML = '<p style="color: #95a5a6; text-align: center;">Enter a search term</p>';
        return;
    }

    const results = [];

    // Search in all subjects
    for (let sem = 1; sem <= 8; sem++) {
        const subjectCount = sem <= 6 ? 6 : 5;
        for (let i = 1; i <= subjectCount; i++) {
            const code = sem.toString() + i.toString().padStart(2, '0');
            const name = semesterSubjects[sem][i - 1];

            if (code.includes(query) || name.toLowerCase().includes(query)) {
                results.push({
                    code, name, sem,
                    year: sem <= 2 ? 1 : sem <= 4 ? 2 : sem <= 6 ? 3 : 4
                });
            }
        }
    }

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No results found</h3>
                <p>Try searching for a subject code or name</p>
            </div>
        `;
    } else {
        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3>Subject ${result.code} - ${result.name}</h3>
                        <p style="color: #95a5a6;">Year ${result.year} • Semester ${result.sem}</p>
                    </div>
                    <button class="btn btn-primary" onclick="
                        currentYear = ${result.year};
                        currentSemester = ${result.sem};
                        selectSubject('${result.code}', ${result.sem}, '${result.name}');
                        showView('documentsView');
                    ">View</button>
                </div>
            `;
            resultsContainer.appendChild(item);
        });
    }
}

// Document Actions
function viewDocument(docName) {
    alert('Opening: ' + docName + '\n\nIn a real implementation, this would open a PDF viewer.');
}

function downloadDocument(docName) {
    console.log('Downloading:', docName);
    // Real download would be implemented here
}

// Navigation
function resetNavigation() {
    currentYear = null;
    currentSemester = null;
    currentSubject = null;
    
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById('yearView').classList.add('active');
    updateBreadcrumb(['Home']);
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.nav-btn').classList.add('active');
}

function updateBreadcrumb(items) {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = items.map((item, idx) => {
        if (idx === 0) {
            return `<a href="javascript:void(0)" onclick="resetNavigation()">${item}</a>`;
        }
        return `<span style="margin: 0 5px;">/</span><span>${item}</span>`;
    }).join('');
}

// Statistics
function updateStatistics() {
    document.getElementById('totalPDFs').textContent = '500+';
    document.getElementById('totalSubjects').textContent = '48';
}

function showStats() {
    showView('statsView');
}

function showAbout() {
    alert('BTech CSE Study Materials Library\nVersion 1.0\n\nA comprehensive platform for organizing and accessing study materials for BTech CSE students.\n\nFeatures:\n- Organize by Year and Semester\n- Browse by Subject\n- Search functionality\n- Easy PDF access\n- Mobile responsive\n\n© 2026');
}

// Scroll to Top Button
function toggleScrollToTopButton() {
    const btn = document.querySelector('.scroll-to-top');
    if (!btn) {
        const newBtn = document.createElement('button');
        newBtn.className = 'scroll-to-top';
        newBtn.innerHTML = '↑';
        newBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.appendChild(newBtn);
    }
}

// Console greeting
console.log('%c🎓 BTech CSE Study Materials Library', 'font-size: 16px; color: #667eea; font-weight: bold;');
console.log('%cVersion 1.0 - Ready for GitHub Pages', 'font-size: 12px; color: #764ba2;');
