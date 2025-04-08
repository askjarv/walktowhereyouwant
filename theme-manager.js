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
        
        // Load saved theme first
        this.loadSavedTheme();
        
        // Initialize UI elements after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.initializeWidgets();
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

    initializeWidgets() {
        // Initialize minimize buttons
        document.querySelectorAll('.minimize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const widget = e.target.closest('.widget');
                widget.classList.toggle('minimized');
                e.target.textContent = widget.classList.contains('minimized') ? '+' : '−';
            });
        });

        // Initialize milestone slider
        const track = document.querySelector('.milestone-track');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (track && prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                track.scrollBy({ left: -track.offsetWidth, behavior: 'smooth' });
            });

            nextBtn.addEventListener('click', () => {
                track.scrollBy({ left: track.offsetWidth, behavior: 'smooth' });
            });

            // Add touch swipe support
            let startX;
            let scrollLeft;

            track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].pageX - track.offsetLeft;
                scrollLeft = track.scrollLeft;
            });

            track.addEventListener('touchmove', (e) => {
                if (!startX) return;
                const x = e.touches[0].pageX - track.offsetLeft;
                const walk = (x - startX) * 2;
                track.scrollLeft = scrollLeft - walk;
            });

            track.addEventListener('touchend', () => {
                startX = null;
            });
        }
    }

    initializeThemeSettings() {
        const settingsModal = document.getElementById('settings-modal');
        const closeButtons = document.querySelectorAll('.close-modal');
        const downloadTemplateBtn = document.getElementById('download-template');
        const themeFile = document.getElementById('theme-file');
        const themeButtons = document.getElementById('theme-buttons');

        if (!settingsModal || !themeButtons || !themeFile) {
            console.warn('Some theme elements not found in the DOM');
            return;
        }

        // Close modal
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                settingsModal.style.display = 'none';
            });
        });

        // Download template
        if (downloadTemplateBtn) {
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
        }

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });

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
        if (!this.currentTheme) return;

        const root = document.documentElement;
        const { globalTheme } = this.currentTheme;

        // Convert hex to RGB for glass effect
        const menuBackgroundRGB = this.hexToRGB(globalTheme.menuBackground);

        // Apply theme colors
        root.style.setProperty('--menu-background', globalTheme.menuBackground);
        root.style.setProperty('--menu-background-rgb', `${menuBackgroundRGB.r}, ${menuBackgroundRGB.g}, ${menuBackgroundRGB.b}`);
        root.style.setProperty('--menu-color', globalTheme.menuColor);
        root.style.setProperty('--text-color', globalTheme.textColor || '#333333');
        root.style.setProperty('--font-family', globalTheme.fontFamily || 'Arial, sans-serif');
    }

    hexToRGB(hex) {
        // Remove the hash if it exists
        hex = hex.replace('#', '');
        
        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b };
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
        
        const track = container.querySelector('.milestone-track');
        if (!track) return;

        // Clear previous content
        track.innerHTML = '';
        
        // Create milestone card
        const card = document.createElement('div');
        card.className = 'milestone-card';
        card.style.backgroundColor = milestone.backgroundColor || 'transparent';
        
        const img = document.createElement('img');
        img.src = milestone.imageUrl;
        img.alt = milestone.text;
        
        const text = document.createElement('p');
        text.textContent = milestone.text;
        
        card.appendChild(img);
        card.appendChild(text);
        track.appendChild(card);
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