class SettingsModal {
    constructor() {
        this.modal = null;
        this.fab = null;
        this.initialize();
    }

    initialize() {
        // Create FAB and modal HTML
        const modalHTML = `
            <button id="settings-fab" class="fab">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                </svg>
            </button>
            <div id="settings-modal" class="modal">
                <div class="modal-content glass-effect">
                    <div class="modal-header">
                        <h2>Settings</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="settings-section">
                            <h3>Theme</h3>
                            <div id="theme-buttons" class="theme-buttons">
                                <!-- Theme buttons will be added here by ThemeManager -->
                            </div>
                            <div class="custom-theme-upload">
                                <label for="theme-file" class="upload-button">Upload Custom Theme</label>
                                <input type="file" id="theme-file" accept=".json" style="display: none;">
                            </div>
                        </div>
                        <div class="settings-section">
                            <h3>Date Filter</h3>
                            <button id="date-filter-button" class="secondary-button">Set Start Date</button>
                            <button id="reset-date-filter" class="secondary-button">Reset Filter</button>
                        </div>
                        <div class="settings-section">
                            <h3>History</h3>
                            <button id="clear-history" class="danger-button">Clear History</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal elements
        this.modal = document.getElementById('settings-modal');
        this.fab = document.getElementById('settings-fab');
        const closeButton = this.modal.querySelector('.close-modal');

        // Add event listeners
        this.fab.addEventListener('click', () => this.show());
        closeButton.addEventListener('click', () => this.hide());
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hide();
            }
        });
    }

    show() {
        if (this.modal) {
            this.modal.style.display = 'flex';
        }
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
}

export default SettingsModal; 