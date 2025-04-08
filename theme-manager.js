class ThemeManager {
    constructor() {
        this.currentTheme = null;
        this.defaultTheme = {
            backgroundColor: '#e8f5e9',
            menuColor: '#2e7d32',
            menuBackground: '#c8e6c9',
            textColor: '#1b5e20',
            fontFamily: "'Open Sans', sans-serif"
        };
        this.loadSavedTheme();
        this.initializeThemeSettings();
    }

    loadSavedTheme() {
        const savedThemeName = localStorage.getItem('currentTheme');
        if (savedThemeName) {
            this.loadTheme(`themes/${savedThemeName}-theme.json`);
        } else {
            this.loadTheme('themes/nature-theme.json');
        }
    }

    saveThemeToStorage(themeName) {
        localStorage.setItem('currentTheme', themeName);
    }

    initializeThemeSettings() {
        // Wait for the settings modal to be created
        const checkForModal = setInterval(() => {
            const themeButtons = document.getElementById('theme-buttons');
            const themeFile = document.getElementById('theme-file');
            
            if (themeButtons && themeFile) {
                clearInterval(checkForModal);
                
                // Add theme buttons
                const themes = ['nature', 'space', 'ocean'];
                themes.forEach(theme => {
                    const button = document.createElement('button');
                    button.className = 'theme-button primary-button';
                    button.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
                    button.addEventListener('click', () => {
                        this.loadTheme(`themes/${theme}-theme.json`);
                        this.saveThemeToStorage(theme);
                    });
                    themeButtons.appendChild(button);
                });

                // Add custom theme upload handler
                themeFile.addEventListener('change', (event) => {
                    this.loadThemeFromFile(event.target.files[0]);
                });
            }
        }, 100);
    }

    async loadThemeFromFile(file) {
        try {
            const text = await file.text();
            const theme = JSON.parse(text);
            if (this.validateTheme(theme)) {
                this.currentTheme = theme;
                this.applyTheme();
                this.saveThemeToStorage('custom');
            }
        } catch (error) {
            console.error('Error loading theme file:', error);
        }
    }

    async loadTheme(url) {
        try {
            const response = await fetch(url);
            const theme = await response.json();
            if (this.validateTheme(theme)) {
                this.currentTheme = theme;
                this.applyTheme();
            }
        } catch (error) {
            console.error('Error loading theme:', error);
            // Fallback to default theme
            this.currentTheme = this.defaultTheme;
            this.applyTheme();
        }
    }

    validateTheme(theme) {
        const requiredProps = ['name', 'globalTheme', 'milestones'];
        const requiredGlobalProps = ['backgroundColor', 'menuColor', 'menuBackground'];
        
        if (!requiredProps.every(prop => prop in theme)) {
            console.error('Theme missing required properties');
            return false;
        }
        
        if (!requiredGlobalProps.every(prop => prop in theme.globalTheme)) {
            console.error('Theme missing required global properties');
            return false;
        }
        
        if (!Array.isArray(theme.milestones)) {
            console.error('Theme milestones must be an array');
            return false;
        }
        
        return true;
    }

    applyTheme() {
        const root = document.documentElement;
        const theme = this.currentTheme.globalTheme;
        
        // Apply global theme settings
        root.style.setProperty('--background-color', theme.backgroundColor);
        root.style.setProperty('--menu-color', theme.menuColor);
        root.style.setProperty('--menu-background', theme.menuBackground);
        root.style.setProperty('--text-color', theme.textColor || '#000000');
        root.style.setProperty('--font-family', theme.fontFamily || "'Open Sans', sans-serif");
    }

    getMilestoneForSteps(steps) {
        if (!this.currentTheme || !this.currentTheme.milestones) return null;
        
        // Sort milestones by steps in descending order
        const sortedMilestones = [...this.currentTheme.milestones].sort((a, b) => b.steps - a.steps);
        
        // Find the first milestone where steps are greater than or equal to the threshold
        return sortedMilestones.find(milestone => steps >= milestone.steps) || null;
    }

    applyMilestoneStyles(container, milestone) {
        if (!container || !milestone) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        // Create and append milestone content
        const img = document.createElement('img');
        img.src = milestone.imageUrl;
        img.alt = milestone.text;
        
        const text = document.createElement('p');
        text.textContent = milestone.text;
        
        container.appendChild(img);
        container.appendChild(text);
        
        // Apply milestone-specific background color if provided
        if (milestone.backgroundColor) {
            container.style.backgroundColor = milestone.backgroundColor;
        }
    }
}

export default ThemeManager; 