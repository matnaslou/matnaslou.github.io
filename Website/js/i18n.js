/**
 * Internationalization (i18n) Module
 * Handles language switching between English and Portuguese
 */

class I18n {
  constructor() {
    this.currentLang = localStorage.getItem('language') || 'en';
    this.translations = {};
    this.observers = [];
  }

  async init() {
    try {
      const response = await fetch('data/translations.json');
      this.translations = await response.json();
      this.applyTranslations();
      this.updateLangButtons();
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }

  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'pt') return;
    
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    this.applyTranslations();
    this.updateLangButtons();
    this.notifyObservers();
  }

  getLanguage() {
    return this.currentLang;
  }

  translate(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLang];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value || key;
  }

  t(key) {
    return this.translate(key);
  }

  applyTranslations() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.translate(key);
      
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Update elements with data-i18n-title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.translate(key);
    });

    // Update document language
    document.documentElement.lang = this.currentLang;
  }

  updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', lang === this.currentLang);
    });
  }

  subscribe(callback) {
    this.observers.push(callback);
  }

  notifyObservers() {
    this.observers.forEach(callback => callback(this.currentLang));
  }
}

// Create and export singleton instance
const i18n = new I18n();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
  
  // Setup language toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      i18n.setLanguage(lang);
    });
  });
});

// Export for use in other modules
window.i18n = i18n;
