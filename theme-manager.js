class ThemeManager {
    constructor() {
        this.currentTheme = null;
        this.defaultTheme = {
            name: "Default Theme",
            globalTheme: {
                backgroundColor: "#ffffff",
                menuColor: "#000000",
                menuBackground: "#f0f0f0",
                textColor: "#000000",
                fontFamily: "Arial, sans-serif"
            }
        };
        this.initializeThemeSettings();
        this.loadSavedTheme();
    }

    loadSavedTheme() {
        const savedThemeName = localStorage.getItem('currentTheme');
        if (savedThemeName) {
            // Try to load the saved theme
            this.loadTheme(`themes/${savedThemeName}-theme.json`)
                .catch(() => {
                    console.warn(`Failed to load saved theme: ${savedThemeName}`);
                    this.loadTheme('themes/nature-theme.json');
                });
        } else {
            // Load default theme if no saved theme
            this.loadTheme('themes/nature-theme.json');
        }
    }

    saveThemeToStorage(themeName) {
        localStorage.setItem('currentTheme', themeName);
    }

    initializeThemeSettings() {
        const modal = document.getElementById('theme-settings-modal');
        const settingsButton = document.getElementById('theme-settings-button');
        const closeButton = document.querySelector('.close-modal');
        const themeButtons = document.querySelectorAll('.theme-button');
        const customThemeFile = document.getElementById('custom-theme-file');

        // Open modal
        settingsButton.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        // Close modal
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Handle theme button clicks
        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const themeName = button.dataset.theme;
                this.loadTheme(`themes/${themeName}-theme.json`);
                this.saveThemeToStorage(themeName);
                modal.style.display = 'none';
            });
        });

        // Handle custom theme file upload
        customThemeFile.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    const theme = await this.loadThemeFromFile(file);
                    this.currentTheme = theme;
                    this.applyTheme();
                    // Save custom theme to localStorage
                    localStorage.setItem('customTheme', JSON.stringify(theme));
                    localStorage.setItem('currentTheme', 'custom');
                    modal.style.display = 'none';
                } catch (error) {
                    console.error('Error loading custom theme:', error);
                    alert('Error loading theme file. Please make sure it follows the correct format.');
                }
            }
        });

        // Check if we have a custom theme saved
        const savedCustomTheme = localStorage.getItem('customTheme');
        if (savedCustomTheme && localStorage.getItem('currentTheme') === 'custom') {
            try {
                const theme = JSON.parse(savedCustomTheme);
                this.validateTheme(theme);
                this.currentTheme = theme;
                this.applyTheme();
            } catch (error) {
                console.error('Error loading saved custom theme:', error);
                this.loadTheme('themes/nature-theme.json');
            }
        }
    }

    async loadThemeFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const theme = JSON.parse(event.target.result);
                    this.validateTheme(theme);
                    resolve(theme);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    async loadTheme(themeUrl) {
        try {
            const response = await fetch(themeUrl);
            if (!response.ok) {
                throw new Error(`Failed to load theme: ${response.statusText}`);
            }
            const theme = await response.json();
            this.validateTheme(theme);
            this.currentTheme = theme;
            this.applyTheme();
            return true;
        } catch (error) {
            console.error('Error loading theme:', error);
            this.currentTheme = this.defaultTheme;
            this.applyTheme();
            return false;
        }
    }

    validateTheme(theme) {
        // Basic validation - in a production environment, you'd want to use a proper JSON Schema validator
        if (!theme.name || !theme.globalTheme) {
            throw new Error('Invalid theme format: missing required properties');
        }
        if (!theme.globalTheme.backgroundColor || 
            !theme.globalTheme.menuColor || 
            !theme.globalTheme.menuBackground) {
            throw new Error('Invalid theme format: missing required theme properties');
        }
    }

    applyTheme() {
        const theme = this.currentTheme;
        const root = document.documentElement;

        // Apply global theme settings
        root.style.setProperty('--background-color', theme.globalTheme.backgroundColor);
        root.style.setProperty('--menu-color', theme.globalTheme.menuColor);
        root.style.setProperty('--menu-background', theme.globalTheme.menuBackground);
        
        if (theme.globalTheme.textColor) {
            root.style.setProperty('--text-color', theme.globalTheme.textColor);
        }
        
        if (theme.globalTheme.fontFamily) {
            root.style.setProperty('--font-family', theme.globalTheme.fontFamily);
        }

        // Update theme name in the UI if there's an element for it
        const themeNameElement = document.getElementById('theme-name');
        if (themeNameElement) {
            themeNameElement.textContent = theme.name;
        }
    }

    getMilestoneForSteps(steps) {
        if (!this.currentTheme || !this.currentTheme.milestones) {
            return null;
        }

        // Sort milestones by steps in descending order
        const sortedMilestones = [...this.currentTheme.milestones].sort((a, b) => b.steps - a.steps);
        
        // Find the first milestone that the user has reached
        return sortedMilestones.find(milestone => steps >= milestone.steps) || null;
    }

    applyMilestoneStyles(milestoneElement, milestone) {
        if (!milestone) return;

        if (milestone.backgroundColor) {
            milestoneElement.style.backgroundColor = milestone.backgroundColor;
        }
        
        if (milestone.imageUrl) {
            const imgElement = milestoneElement.querySelector('img');
            if (imgElement) {
                imgElement.src = milestone.imageUrl;
                imgElement.alt = milestone.text;
            }
        }

        const textElement = milestoneElement.querySelector('.milestone-text');
        if (textElement && milestone.text) {
            textElement.textContent = milestone.text;
        }
    }
}

// Export the ThemeManager class
export default ThemeManager; 