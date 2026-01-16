/**
 * Research Module
 * Handles research items display with tabs and abstracts
 */

class ResearchManager {
    constructor() {
        this.data = {
            publications: [],
            working_papers: [],
            works_in_progress: []
        };
    }

    async init() {
        try {
            const response = await fetch('data/research.json');
            this.data = await response.json();

            this.render();
            this.setupTabs();

            // Re-render when language changes
            if (window.i18n) {
                window.i18n.subscribe(() => this.render());
            }
        } catch (error) {
            console.error('Failed to load research data:', error);
        }
    }

    getCurrentLang() {
        return window.i18n?.getLanguage() || 'en';
    }

    render() {
        this.renderList('publicationsList', this.data.publications, 'published');
        this.renderList('workingPapersList', this.data.working_papers, 'working');
        this.renderList('worksInProgressList', this.data.works_in_progress, 'progress');
    }

    renderList(containerId, items, statusType) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const lang = this.getCurrentLang();

        if (!items || items.length === 0) {
            const emptyMessages = {
                'published': lang === 'pt' ? 'Nenhuma publicação ainda' : 'No publications yet',
                'working': lang === 'pt' ? 'Nenhum working paper ainda' : 'No working papers yet',
                'progress': lang === 'pt' ? 'Nenhum trabalho em andamento' : 'No works in progress'
            };

            container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>${emptyMessages[statusType]}</h3>
        </div>
      `;
            return;
        }

        container.innerHTML = items.map(item => this.createResearchCard(item, statusType, lang)).join('');
        this.setupAbstractToggles(container);
    }

    createResearchCard(item, statusType, lang) {
        const title = item.title[lang] || item.title.en;
        const abstract = item.abstract[lang] || item.abstract.en;
        const coauthors = item.coauthors?.length > 0
            ? (lang === 'pt' ? 'com ' : 'with ') + item.coauthors.join(', ')
            : '';

        const statusLabels = {
            'published': { en: 'Published', pt: 'Publicado' },
            'working': { en: 'Working Paper', pt: 'Working Paper' },
            'progress': { en: 'In Progress', pt: 'Em Andamento' }
        };

        const statusLabel = statusLabels[statusType][lang];
        const abstractLabel = lang === 'pt' ? 'Resumo' : 'Abstract';
        const readMoreLabel = lang === 'pt' ? 'Ler Mais' : 'Read More';
        const showLessLabel = lang === 'pt' ? 'Mostrar Menos' : 'Show Less';

        return `
      <article class="card research-card">
        <div class="research-card-image-wrapper">
          ${item.image
                ? `<img src="${item.image}" alt="${title}" class="research-card-image" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'research-card-image\\' style=\\'display:flex;align-items:center;justify-content:center;font-size:48px;background:var(--bg-tertiary);\\'>📄</div>'">`
                : `<div class="research-card-image" style="display:flex;align-items:center;justify-content:center;font-size:48px;background:var(--bg-tertiary);">📄</div>`
            }
        </div>
        <div class="research-card-content">
          <span class="research-status ${statusType}">${statusLabel}</span>
          <h3 class="research-card-title">${title}</h3>
          ${coauthors ? `<p class="research-card-authors">${coauthors}</p>` : ''}
          
          <div class="research-abstract-container">
            <h4 style="font-size: var(--text-sm); font-weight: 600; margin-bottom: var(--space-2); color: var(--text-secondary);">${abstractLabel}</h4>
            <p class="research-card-abstract" data-full-text="${abstract.replace(/"/g, '&quot;')}">${abstract}</p>
            <button class="btn btn-ghost btn-sm abstract-toggle" data-read-more="${readMoreLabel}" data-show-less="${showLessLabel}">
              ${readMoreLabel}
            </button>
          </div>
          
          ${item.links && item.links.length > 0 ? `
            <div class="research-card-links">
              ${item.links.map(link => `
                <a href="${link.url}" class="btn btn-sm ${link.type === 'pdf' ? 'btn-primary' : 'btn-secondary'}" target="_blank" rel="noopener noreferrer">
                  ${link.type === 'pdf' ? 'PDF' : link.label}
                </a>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </article>
    `;
    }

    setupAbstractToggles(container) {
        container.querySelectorAll('.abstract-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const abstract = btn.previousElementSibling;
                const isExpanded = abstract.classList.contains('expanded');

                abstract.classList.toggle('expanded');
                btn.textContent = isExpanded ? btn.dataset.readMore : btn.dataset.showLess;
            });
        });
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.tab;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetId) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('publicationsList')) {
        const researchManager = new ResearchManager();
        researchManager.init();
        window.researchManager = researchManager;
    }
});
