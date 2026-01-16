/**
 * Theme Customization Module
 * Handles color theming and customization
 */

class ThemeManager {
    constructor() {
        this.presets = {
            academic: { hue: 220, name: 'Academic Blue' },
            forest: { hue: 150, name: 'Forest Green' },
            sunset: { hue: 25, name: 'Warm Orange' },
            lavender: { hue: 270, name: 'Lavender' },
            rose: { hue: 350, name: 'Rose' },
            ocean: { hue: 195, name: 'Ocean Teal' },
            gold: { hue: 45, name: 'Gold' },
            slate: { hue: 215, name: 'Slate' }
        };

        this.currentHue = parseInt(localStorage.getItem('themeHue')) || 220;
        this.isPanelOpen = false;
    }

    init() {
        this.applyTheme(this.currentHue);
        this.setupEventListeners();
        this.renderPresets();
    }

    applyTheme(hue) {
        this.currentHue = hue;
        document.documentElement.style.setProperty('--primary-hue', hue);
        localStorage.setItem('themeHue', hue);

        // Update active preset indicator
        this.updatePresetIndicators();

        // Update color picker if exists
        const picker = document.getElementById('colorPicker');
        if (picker) {
            picker.value = this.hslToHex(hue, 70, 50);
        }
    }

    setPreset(presetName) {
        const preset = this.presets[presetName];
        if (preset) {
            this.applyTheme(preset.hue);
        }
    }

    hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    hexToHsl(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    renderPresets() {
        const container = document.getElementById('themePresets');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.presets).forEach(([key, preset]) => {
            const btn = document.createElement('button');
            btn.className = 'theme-preset';
            btn.setAttribute('data-preset', key);
            btn.setAttribute('title', preset.name);
            btn.style.background = `hsl(${preset.hue}, 70%, 50%)`;

            if (preset.hue === this.currentHue) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', () => this.setPreset(key));
            container.appendChild(btn);
        });
    }

    updatePresetIndicators() {
        document.querySelectorAll('.theme-preset').forEach(btn => {
            const presetKey = btn.getAttribute('data-preset');
            const preset = this.presets[presetKey];
            btn.classList.toggle('active', preset && preset.hue === this.currentHue);
        });
    }

    togglePanel() {
        const panel = document.getElementById('themePanel');
        if (panel) {
            this.isPanelOpen = !this.isPanelOpen;
            panel.classList.toggle('active', this.isPanelOpen);
        }
    }

    closePanel() {
        const panel = document.getElementById('themePanel');
        if (panel) {
            this.isPanelOpen = false;
            panel.classList.remove('active');
        }
    }

    setupEventListeners() {
        // Theme toggle button
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePanel();
            });
        }

        // Color picker
        const picker = document.getElementById('colorPicker');
        if (picker) {
            picker.value = this.hslToHex(this.currentHue, 70, 50);
            picker.addEventListener('input', (e) => {
                const hsl = this.hexToHsl(e.target.value);
                this.applyTheme(hsl.h);
            });
        }

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('themePanel');
            const toggleBtn = document.getElementById('themeToggleBtn');

            if (panel && this.isPanelOpen) {
                if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
                    this.closePanel();
                }
            }
        });

        // Reset button
        const resetBtn = document.getElementById('themeReset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.applyTheme(220); // Default academic blue
            });
        }
    }
}

// Create and export singleton
const themeManager = new ThemeManager();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
});

window.themeManager = themeManager;
