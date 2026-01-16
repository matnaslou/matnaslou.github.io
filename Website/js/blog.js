/**
 * Blog Module
 * Handles blog post listing, filtering, and pagination
 */

class BlogManager {
    constructor() {
        this.posts = [];
        this.categories = {};
        this.tags = [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentCategory = 'all';
        this.currentTag = null;
        this.searchQuery = '';
    }

    async init() {
        try {
            const response = await fetch('data/blog-posts.json');
            const data = await response.json();

            this.posts = data.posts.filter(post => post.published);
            this.categories = data.categories;
            this.tags = data.tags;

            this.render();
            this.setupEventListeners();

            // Re-render when language changes
            if (window.i18n) {
                window.i18n.subscribe(() => this.render());
            }
        } catch (error) {
            console.error('Failed to load blog posts:', error);
            this.renderEmpty();
        }
    }

    getCurrentLang() {
        return window.i18n?.getLanguage() || 'en';
    }

    getFilteredPosts() {
        let filtered = [...this.posts];

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(post => post.category === this.currentCategory);
        }

        // Filter by tag
        if (this.currentTag) {
            filtered = filtered.filter(post => post.tags.includes(this.currentTag));
        }

        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            const lang = this.getCurrentLang();
            filtered = filtered.filter(post => {
                const title = post.title[lang].toLowerCase();
                const excerpt = post.excerpt[lang].toLowerCase();
                return title.includes(query) || excerpt.includes(query);
            });
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        return filtered;
    }

    getPaginatedPosts() {
        const filtered = this.getFilteredPosts();
        const start = (this.currentPage - 1) * this.postsPerPage;
        const end = start + this.postsPerPage;
        return filtered.slice(start, end);
    }

    getTotalPages() {
        return Math.ceil(this.getFilteredPosts().length / this.postsPerPage);
    }

    render() {
        this.renderPosts();
        this.renderCategories();
        this.renderTags();
        this.renderPagination();
    }

    renderPosts() {
        const container = document.getElementById('blogGrid');
        if (!container) return;

        const posts = this.getPaginatedPosts();
        const lang = this.getCurrentLang();

        if (posts.length === 0) {
            this.renderEmpty();
            return;
        }

        container.innerHTML = posts.map(post => this.createPostCard(post, lang)).join('');
    }

    createPostCard(post, lang) {
        const date = window.utils?.formatDate(post.date, lang) || post.date;
        const categoryName = this.categories[lang]?.[post.category] || post.category;
        const readingTimeText = lang === 'pt' ? 'min de leitura' : 'min read';

        return `
      <article class="blog-card" data-post-id="${post.id}">
        <div class="blog-card-image" style="background: linear-gradient(135deg, var(--primary-light), var(--bg-tertiary));">
          ${post.image ? `<img src="${post.image}" alt="${post.title[lang]}" loading="lazy">` : ''}
        </div>
        <div class="blog-card-content">
          <div class="blog-card-meta">
            <span>${date}</span>
            <span>•</span>
            <span>${post.readingTime} ${readingTimeText}</span>
          </div>
          <h3 class="blog-card-title">
            <a href="blog-post.html?id=${post.id}">${post.title[lang]}</a>
          </h3>
          <p class="blog-card-excerpt">${post.excerpt[lang]}</p>
          <div class="blog-card-tags">
            ${post.tags.slice(0, 3).map(tag => `
              <span class="tag" data-tag="${tag}">${tag}</span>
            `).join('')}
          </div>
        </div>
      </article>
    `;
    }

    renderEmpty() {
        const container = document.getElementById('blogGrid');
        if (!container) return;

        const lang = this.getCurrentLang();
        const message = lang === 'pt' ? 'Nenhum post encontrado' : 'No posts found';

        container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <h3>${message}</h3>
      </div>
    `;
    }

    renderCategories() {
        const container = document.getElementById('categoryList');
        if (!container) return;

        const lang = this.getCurrentLang();
        const allText = lang === 'pt' ? 'Todos' : 'All';

        let html = `
      <a href="#" class="category-item ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">
        <span>${allText}</span>
        <span>${this.posts.length}</span>
      </a>
    `;

        Object.entries(this.categories[lang] || {}).forEach(([key, name]) => {
            const count = this.posts.filter(p => p.category === key).length;
            if (count > 0) {
                html += `
          <a href="#" class="category-item ${this.currentCategory === key ? 'active' : ''}" data-category="${key}">
            <span>${name}</span>
            <span>${count}</span>
          </a>
        `;
            }
        });

        container.innerHTML = html;
    }

    renderTags() {
        const container = document.getElementById('tagCloud');
        if (!container) return;

        // Get unique tags from published posts
        const usedTags = new Set();
        this.posts.forEach(post => post.tags.forEach(tag => usedTags.add(tag)));

        container.innerHTML = Array.from(usedTags).map(tag => `
      <span class="tag ${this.currentTag === tag ? 'active' : ''}" data-tag="${tag}">${tag}</span>
    `).join('');
    }

    renderPagination() {
        const container = document.getElementById('blogPagination');
        if (!container) return;

        const totalPages = this.getTotalPages();
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
      <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
        </svg>
      </button>
    `;

        for (let i = 1; i <= totalPages; i++) {
            html += `
        <button class="pagination-btn ${this.currentPage === i ? 'active' : ''}" data-page="${i}">${i}</button>
      `;
        }

        html += `
      <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    `;

        container.innerHTML = html;
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('blogSearch');
        if (searchInput) {
            searchInput.addEventListener('input', window.utils?.debounce((e) => {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.render();
            }, 300) || ((e) => {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.render();
            }));
        }

        // Category links - use event delegation
        const categoryList = document.getElementById('categoryList');
        if (categoryList) {
            categoryList.addEventListener('click', (e) => {
                const link = e.target.closest('.category-item');
                if (link) {
                    e.preventDefault();
                    this.currentCategory = link.dataset.category;
                    this.currentTag = null;
                    this.currentPage = 1;
                    this.render();
                }
            });
        }

        // Tags - use event delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag') && e.target.dataset.tag) {
                this.currentTag = this.currentTag === e.target.dataset.tag ? null : e.target.dataset.tag;
                this.currentPage = 1;
                this.render();
            }
        });

        // Pagination - use event delegation
        const pagination = document.getElementById('blogPagination');
        if (pagination) {
            pagination.addEventListener('click', (e) => {
                const btn = e.target.closest('.pagination-btn');
                if (btn && !btn.disabled) {
                    this.currentPage = parseInt(btn.dataset.page);
                    this.render();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    }
}

// Initialize on DOM ready if on blog page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('blogGrid')) {
        const blogManager = new BlogManager();
        blogManager.init();
        window.blogManager = blogManager;
    }
});
