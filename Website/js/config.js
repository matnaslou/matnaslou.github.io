/**
 * Configuration Module
 * Loads centralized config and applies social links across all pages
 */

class ConfigManager {
    constructor() {
        this.config = null;
    }

    async init() {
        try {
            const response = await fetch('data/config.json');
            this.config = await response.json();
            this.applySocialLinks();
            this.applyProfileInfo();
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    }

    getConfig() {
        return this.config;
    }

    getSocial(platform) {
        return this.config?.social?.[platform] || '#';
    }

    applySocialLinks() {
        if (!this.config?.social) return;

        // Update all social links by data-social attribute
        document.querySelectorAll('[data-social]').forEach(link => {
            const platform = link.getAttribute('data-social');
            const url = this.config.social[platform];
            if (url) {
                link.href = url;
            }
        });

        // Update footer text links
        document.querySelectorAll('[data-social-text]').forEach(link => {
            const platform = link.getAttribute('data-social-text');
            const url = this.config.social[platform];
            if (url) {
                link.href = url;
            }
        });
    }

    applyProfileInfo() {
        if (!this.config?.profile) return;

        // Update name elements
        document.querySelectorAll('[data-profile="name"]').forEach(el => {
            el.textContent = this.config.profile.name;
        });

        // Update CV download links
        if (this.config.cv?.pdfPath) {
            document.querySelectorAll('[data-cv-download]').forEach(link => {
                link.href = this.config.cv.pdfPath;
            });
        }
    }
}

// Create and export singleton
const configManager = new ConfigManager();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    configManager.init();
});

window.configManager = configManager;
