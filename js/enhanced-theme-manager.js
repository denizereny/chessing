/**
 * Enhanced Theme Manager for 4x5 Chess Piece Setup
 * 
 * Manages dark/light mode switching, theme persistence, and system preference detection
 * 
 * Features:
 * - Automatic system theme detection
 * - Theme persistence in localStorage
 * - Smooth theme transitions
 * - Accessibility compliance
 * - Event-driven architecture
 * 
 * Requirements: 1.1, 1.2, 1.5
 * Task: 10.2 CSS styling sistemi tamamla - Dark/light mode desteği
 */

class EnhancedThemeManager {
    constructor() {
        this.currentTheme = null;
        this.systemTheme = null;
        this.themeToggleButton = null;
        this.themeChangeCallbacks = [];
        this.storageKey = 'enhanced-chess-theme';
        this.transitionDuration = 300;
        
        this.init();
    }
    
    /**
     * Initialize the theme manager
     */
    init() {
        this.detectSystemTheme();
        this.loadSavedTheme();
        this.createThemeToggle();
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
        
        // Mark as initialized
        document.documentElement.setAttribute('data-theme-manager', 'initialized');
        
        console.log('Enhanced Theme Manager initialized:', {
            currentTheme: this.currentTheme,
            systemTheme: this.systemTheme
        });
    }
    
    /**
     * Detect system theme preference
     */
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.systemTheme = 'dark';
        } else {
            this.systemTheme = 'light';
        }
        
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                this.systemTheme = e.matches ? 'dark' : 'light';
                
                // If no manual theme is set, follow system preference
                if (!localStorage.getItem(this.storageKey)) {
                    this.setTheme(this.systemTheme);
                }
                
                this.notifyThemeChange('system-change', this.systemTheme);
            });
        }
    }
    
    /**
     * Load saved theme from localStorage
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(this.storageKey);
        
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
            this.currentTheme = savedTheme === 'auto' ? this.systemTheme : savedTheme;
        } else {
            // Default to system preference
            this.currentTheme = this.systemTheme;
        }
    }
    
    /**
     * Create theme toggle button
     * DISABLED: Theme toggle is now in the settings menu, no need for separate button
     */
    createThemeToggle() {
        // Theme toggle button creation disabled
        // The theme toggle is now integrated into the settings menu
        // No separate floating button is needed
        return;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.themeToggleButton) {
            // Click event
            this.themeToggleButton.addEventListener('click', (e) => {
                this.handleToggleClick(e);
            });
            
            // Keyboard event
            this.themeToggleButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleToggleClick(e);
                }
            });
            
            // Mouse events for enhanced UX
            this.themeToggleButton.addEventListener('mouseenter', () => {
                this.updateTooltip();
            });
        }
        
        // Listen for manual theme changes
        document.addEventListener('theme-change', (e) => {
            this.handleExternalThemeChange(e.detail);
        });
        
        // Listen for reduced motion preference
        if (window.matchMedia) {
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            motionQuery.addEventListener('change', (e) => {
                document.documentElement.classList.toggle('reduced-motion', e.matches);
            });
            
            // Apply initial state
            if (motionQuery.matches) {
                document.documentElement.classList.add('reduced-motion');
            }
        }
    }
    
    /**
     * Handle theme toggle click
     */
    handleToggleClick(event) {
        const clickX = event.clientX;
        const clickY = event.clientY;
        
        // Add loading state
        this.themeToggleButton.classList.add('loading');
        
        // Calculate next theme
        const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        
        // Create transition effect
        this.createTransitionEffect(clickX, clickY);
        
        // Change theme after a short delay for smooth transition
        setTimeout(() => {
            this.setTheme(nextTheme);
            this.saveTheme(nextTheme);
            
            // Remove loading state
            this.themeToggleButton.classList.remove('loading');
            this.themeToggleButton.classList.add('pulse');
            
            // Show persistence indicator
            const indicator = this.themeToggleButton.querySelector('.theme-persistence-indicator');
            if (indicator) {
                indicator.classList.add('active');
                setTimeout(() => {
                    indicator.classList.remove('active');
                }, 2000);
            }
            
            // Remove pulse effect
            setTimeout(() => {
                this.themeToggleButton.classList.remove('pulse');
            }, 600);
            
        }, 150);
        
        // Analytics/tracking
        this.trackThemeChange(nextTheme, 'manual');
    }
    
    /**
     * Create transition effect
     */
    createTransitionEffect(clickX, clickY) {
        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = 'theme-change-overlay';
        
        // Set click position for radial gradient
        overlay.style.setProperty('--click-x', `${clickX}px`);
        overlay.style.setProperty('--click-y', `${clickY}px`);
        
        document.body.appendChild(overlay);
        
        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
        
        // Remove overlay after transition
        setTimeout(() => {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 500);
        }, this.transitionDuration);
    }
    
    /**
     * Set theme
     */
    setTheme(theme) {
        if (!['light', 'dark'].includes(theme)) {
            console.warn('Invalid theme:', theme);
            return;
        }
        
        const previousTheme = this.currentTheme;
        this.currentTheme = theme;
        
        // Apply theme to document
        this.applyTheme(theme);
        
        // Update toggle button
        this.updateToggleButton();
        
        // Notify listeners
        this.notifyThemeChange('manual', theme, previousTheme);
        
        console.log('Theme changed:', { from: previousTheme, to: theme });
    }
    
    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        // Add transition class for smooth change
        document.documentElement.classList.add('theme-changing');
        
        // Set theme attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        // Update favicon if needed
        this.updateFavicon(theme);
        
        // Remove transition class after change
        setTimeout(() => {
            document.documentElement.classList.remove('theme-changing');
            document.documentElement.classList.add('theme-transition');
        }, 50);
        
        // Remove transition class after animation
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, this.transitionDuration + 50);
    }
    
    /**
     * Update meta theme color for mobile browsers
     */
    updateMetaThemeColor(theme) {
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            document.head.appendChild(themeColorMeta);
        }
        
        const colors = {
            light: '#ffffff',
            dark: '#0f172a'
        };
        
        themeColorMeta.content = colors[theme] || colors.light;
    }
    
    /**
     * Update favicon based on theme
     */
    updateFavicon(theme) {
        // This is optional - only if you have theme-specific favicons
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon && favicon.dataset.themeAware === 'true') {
            const basePath = favicon.href.replace(/-(light|dark)\./, '.');
            const newPath = basePath.replace(/\.([^.]+)$/, `-${theme}.$1`);
            favicon.href = newPath;
        }
    }
    
    /**
     * Update toggle button state
     */
    updateToggleButton() {
        if (!this.themeToggleButton) return;
        
        const srText = this.themeToggleButton.querySelector('.theme-toggle-sr-text');
        if (srText) {
            srText.textContent = `Current theme: ${this.currentTheme}. Click to switch to ${this.currentTheme === 'light' ? 'dark' : 'light'} theme.`;
        }
        
        // Update aria-label
        this.themeToggleButton.setAttribute('aria-label', 
            `Switch to ${this.currentTheme === 'light' ? 'dark' : 'light'} theme`);
        
        // Update tooltip
        this.updateTooltip();
    }
    
    /**
     * Update tooltip text
     */
    updateTooltip() {
        const tooltip = this.themeToggleButton?.querySelector('.theme-toggle-tooltip');
        if (tooltip) {
            tooltip.textContent = this.getTooltipText();
        }
    }
    
    /**
     * Get tooltip text
     */
    getTooltipText() {
        const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        return `Switch to ${nextTheme} theme`;
    }
    
    /**
     * Save theme to localStorage
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.storageKey, theme);
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    }
    
    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    /**
     * Get system theme
     */
    getSystemTheme() {
        return this.systemTheme;
    }
    
    /**
     * Check if theme is manually set
     */
    isThemeManuallySet() {
        return localStorage.getItem(this.storageKey) !== null;
    }
    
    /**
     * Reset to system theme
     */
    resetToSystemTheme() {
        localStorage.removeItem(this.storageKey);
        this.setTheme(this.systemTheme);
        this.notifyThemeChange('reset', this.systemTheme);
    }
    
    /**
     * Add theme change callback
     */
    onThemeChange(callback) {
        if (typeof callback === 'function') {
            this.themeChangeCallbacks.push(callback);
        }
    }
    
    /**
     * Remove theme change callback
     */
    offThemeChange(callback) {
        const index = this.themeChangeCallbacks.indexOf(callback);
        if (index > -1) {
            this.themeChangeCallbacks.splice(index, 1);
        }
    }
    
    /**
     * Notify theme change
     */
    notifyThemeChange(source, newTheme, previousTheme = null) {
        const eventData = {
            source,
            theme: newTheme,
            previousTheme: previousTheme || this.currentTheme,
            timestamp: Date.now()
        };
        
        // Call registered callbacks
        this.themeChangeCallbacks.forEach(callback => {
            try {
                callback(eventData);
            } catch (error) {
                console.error('Theme change callback error:', error);
            }
        });
        
        // Dispatch custom event
        const customEvent = new CustomEvent('enhanced-theme-change', {
            detail: eventData
        });
        document.dispatchEvent(customEvent);
    }
    
    /**
     * Handle external theme changes
     */
    handleExternalThemeChange(data) {
        if (data && data.theme && data.theme !== this.currentTheme) {
            this.setTheme(data.theme);
            if (data.persist !== false) {
                this.saveTheme(data.theme);
            }
        }
    }
    
    /**
     * Track theme changes for analytics
     */
    trackThemeChange(theme, source) {
        // This can be extended to send analytics data
        if (window.gtag) {
            window.gtag('event', 'theme_change', {
                theme_name: theme,
                change_source: source
            });
        }
        
        if (window.analytics) {
            window.analytics.track('Theme Changed', {
                theme: theme,
                source: source,
                timestamp: new Date().toISOString()
            });
        }
        
        console.log('Theme change tracked:', { theme, source });
    }
    
    /**
     * Get theme statistics
     */
    getThemeStats() {
        return {
            currentTheme: this.currentTheme,
            systemTheme: this.systemTheme,
            isManuallySet: this.isThemeManuallySet(),
            supportsSystemDetection: window.matchMedia ? true : false,
            storageAvailable: this.isStorageAvailable()
        };
    }
    
    /**
     * Check if localStorage is available
     */
    isStorageAvailable() {
        try {
            const test = '__theme_storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Destroy theme manager
     */
    destroy() {
        // Remove event listeners
        if (this.themeToggleButton) {
            this.themeToggleButton.removeEventListener('click', this.handleToggleClick);
            this.themeToggleButton.removeEventListener('keydown', this.handleToggleClick);
        }
        
        // Remove toggle button
        const container = document.querySelector('.theme-toggle-container');
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        
        // Clear callbacks
        this.themeChangeCallbacks = [];
        
        // Remove theme attributes
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-theme-manager');
        
        console.log('Enhanced Theme Manager destroyed');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedThemeManager = new EnhancedThemeManager();
    });
} else {
    window.enhancedThemeManager = new EnhancedThemeManager();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedThemeManager;
}

// AMD support
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return EnhancedThemeManager;
    });
}