document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const papersGrid = document.getElementById('papersGrid');
    const loadingContainer = document.getElementById('loadingContainer');
    const errorContainer = document.getElementById('errorContainer');
    const noResults = document.getElementById('noResults');
    const retryBtn = document.getElementById('retryBtn');
    const newspaperSearch = document.getElementById('newspaperSearch');
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    const lastUpdatedTime = document.getElementById('lastUpdatedTime');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    let allPapers = [];

    // 1. Initialize Bangladesh Time Display
    function updateBangladeshDateTime() {
        try {
            const now = new Date();
            
            // Format current date in Asia/Dhaka
            const dateOptions = {
                timeZone: 'Asia/Dhaka',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const dateFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
            currentDateDisplay.textContent = dateFormatter.format(now);
        } catch (e) {
            console.error('Error formatting date:', e);
            currentDateDisplay.textContent = 'Friday, October 3, 2026';
        }
    }

    updateBangladeshDateTime();

    // 2. Mobile Menu Toggle
    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        hamburgerBtn.classList.toggle('active');
    });

    // Close mobile menu on nav link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            hamburgerBtn.classList.remove('active');
        });
    });

    // 3. Fetch Papers Data
    async function loadPapersData() {
        try {
            loadingContainer.classList.remove('hidden');
            errorContainer.classList.add('hidden');
            papersGrid.innerHTML = '';
            noResults.classList.add('hidden');

            const response = await fetch('data/papers.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.updatedAt) {
                lastUpdatedTime.textContent = data.updatedAt;
            }

            allPapers = data.papers || [];
            
            loadingContainer.classList.add('hidden');
            
            if (allPapers.length === 0) {
                errorContainer.classList.remove('hidden');
                return;
            }

            renderPapers(allPapers);

        } catch (err) {
            console.error('Failed to load papers data:', err);
            loadingContainer.classList.add('hidden');
            errorContainer.classList.remove('hidden');
        }
    }

    // Sanitize text to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 4. Render Papers to Grid
    function renderPapers(papers) {
        papersGrid.innerHTML = '';

        if (papers.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }

        noResults.classList.add('hidden');

        papers.forEach(paper => {
            const name = escapeHtml(paper.name);
            const nameEn = escapeHtml(paper.nameEn);
            const description = escapeHtml(paper.description || 'Official e-paper');
            const epaperUrl = escapeHtml(paper.url);
            const officialUrl = escapeHtml(paper.official);

            const card = document.createElement('div');
            card.className = 'paper-card';
            
            card.innerHTML = `
                <div>
                    <div class="paper-card-header">
                        <div class="paper-icon-box">📰</div>
                        <span class="status-tag">Active</span>
                    </div>
                    <div class="paper-titles">
                        <h3>${name}</h3>
                        <h4>${nameEn}</h4>
                    </div>
                    <p class="paper-desc">${description}</p>
                </div>
                <div class="paper-actions">
                    <a href="${epaperUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                        Read E-Paper ↗
                    </a>
                    <a href="${officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                        Website
                    </a>
                </div>
            `;

            papersGrid.appendChild(card);
        });
    }

    // 5. Live Search Functionality
    newspaperSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        const filtered = allPapers.filter(paper => {
            const bnMatch = paper.name && paper.name.toLowerCase().includes(query);
            const enMatch = paper.nameEn && paper.nameEn.toLowerCase().includes(query);
            return bnMatch || enMatch;
        });

        renderPapers(filtered);
    });

    // Retry Button Event
    retryBtn.addEventListener('click', loadPapersData);

    // Initial load
    loadPapersData();
});
