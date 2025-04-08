class ThemeManager {
    constructor() {
        this.currentTheme = null;
        this.defaultTheme = {
            backgroundColor: '#f0f8ff',
            menuColor: '#4a90e2',
            menuBackground: '#ffffff',
            textColor: '#333333',
            fontFamily: 'Arial, sans-serif'
        };
        this.loadSavedTheme();
        this.initializeThemeSettings();
        this.initializeThemeInstructions();
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
        const settingsBtn = document.getElementById('theme-settings-btn');
        const instructionsBtn = document.getElementById('theme-instructions-btn');
        const settingsModal = document.getElementById('theme-settings');
        const instructionsModal = document.getElementById('theme-instructions');
        const closeButtons = document.querySelectorAll('.close');
        const downloadTemplateBtn = document.getElementById('download-template');

        // Theme settings modal
        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'block';
        });

        // Theme instructions modal
        instructionsBtn.addEventListener('click', () => {
            instructionsModal.style.display = 'block';
        });

        // Close modals
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                settingsModal.style.display = 'none';
                instructionsModal.style.display = 'none';
            });
        });

        // Download template
        downloadTemplateBtn.addEventListener('click', () => {
            const template = {
                name: "My Custom Theme",
                globalTheme: {
                    backgroundColor: "#ffffff",
                    menuColor: "#4CAF50",
                    menuBackground: "#45a049",
                    textColor: "#333333",
                    fontFamily: "Arial, sans-serif"
                },
                milestones: [
                    {
                        steps: 1000,
                        imageUrl: "https://example.com/image1.jpg",
                        text: "First milestone reached!",
                        backgroundColor: "#f0f0f0"
                    },
                    {
                        steps: 5000,
                        imageUrl: "https://example.com/image2.jpg",
                        text: "Half way there!"
                    }
                ]
            };

            const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'theme-template.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
            if (event.target === instructionsModal) {
                instructionsModal.style.display = 'none';
            }
        });

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

        // Add theme instructions button
        const themeInstructionsBtn = document.createElement('button');
        themeInstructionsBtn.textContent = 'Theme Instructions';
        themeInstructionsBtn.className = 'theme-instructions-btn';
        document.querySelector('.settings-container').appendChild(themeInstructionsBtn);

        themeInstructionsBtn.addEventListener('click', () => this.showThemeInstructions());
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

    showThemeInstructions() {
        const modal = document.createElement('div');
        modal.className = 'theme-instructions';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>How to Create a Custom Theme</h2>
                <p>Follow these steps to create your own theme:</p>
                <ol>
                    <li>Download the sample theme template below</li>
                    <li>Edit the JSON file with your preferred colors and milestones</li>
                    <li>Replace the image URLs with your own image links</li>
                    <li>Save the file and upload it using the "Upload Custom Theme" button</li>
                </ol>
                <p>Color values should be in CSS format (e.g., #RRGGBB or rgb(r,g,b))</p>
                <button class="download-template-btn">Download Template</button>
                <button class="close-modal-btn">Close</button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.download-template-btn').addEventListener('click', () => {
            this.downloadThemeTemplate();
        });
    }

    initializeThemeInstructions() {
        const instructionsBtn = document.getElementById('theme-instructions-btn');
        const instructionsModal = document.getElementById('theme-instructions');
        const closeBtn = document.querySelector('.close-instructions');
        const downloadTemplateBtn = document.getElementById('download-template');

        if (instructionsBtn) {
            instructionsBtn.addEventListener('click', () => {
                instructionsModal.style.display = 'flex';
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                instructionsModal.style.display = 'none';
            });
        }

        if (downloadTemplateBtn) {
            downloadTemplateBtn.addEventListener('click', () => {
                this.downloadThemeTemplate();
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === instructionsModal) {
                instructionsModal.style.display = 'none';
            }
        });
    }

    downloadThemeTemplate() {
        fetch('sample-theme.json')
            .then(response => response.json())
            .then(data => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'my-custom-theme.json';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch(error => {
                console.error('Error downloading template:', error);
                alert('Error downloading template. Please try again.');
            });
    }
}

export default ThemeManager; 