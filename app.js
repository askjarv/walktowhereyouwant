import ThemeManager from './theme-manager.js';
import StepsTracker from './steps-tracker.js';
import WelcomeModal from './welcome-modal.js';
import SettingsModal from './settings-modal.js';
import StepGauge from './step-gauge.js';

// DOM Elements
const loginButton = document.getElementById('login-button');
const stepsCount = document.getElementById('steps-count');
const importSettingsButton = document.getElementById('import-settings');
const stepsHistory = document.getElementById('steps-history');

// Check if we have a token in localStorage
let accessToken = localStorage.getItem('fitbit_access_token');

class FitbitApp {
    constructor() {
        this.accessToken = localStorage.getItem('fitbit_access_token');
        this.themeManager = new ThemeManager();
        this.stepsTracker = new StepsTracker();
        this.welcomeModal = new WelcomeModal();
        this.settingsModal = new SettingsModal();
        this.stepGauge = new StepGauge('step-gauge-container');
        this.dailyGoal = 10000; // Default daily goal
        this.connectionStatus = document.getElementById('connection-status');
        this.disconnectButton = document.getElementById('disconnect-fitbit');
        
        this.disconnectButton.addEventListener('click', () => this.disconnectFitbit());
        
        // Initialize UI elements after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initializeUI() {
        // Initialize date filter modal
        this.dateFilterModal = document.getElementById('date-filter-modal');
        this.dateFilterButton = document.getElementById('date-filter-button');
        this.startDateInput = document.getElementById('start-date');
        this.applyDateFilterButton = document.getElementById('apply-date-filter');
        this.resetDateFilterButton = document.getElementById('reset-date-filter');
        this.clearHistoryButton = document.getElementById('clear-history');
        this.stepsCount = document.getElementById('steps-count');
        
        // Set today's date as max date for the date picker
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        if (this.startDateInput) {
            this.startDateInput.max = formattedToday;
        }
    }

    initializeEventListeners() {
        // Login button
        const loginButton = document.getElementById('login-button');
        if (loginButton) {
            loginButton.addEventListener('click', () => this.redirectToFitbitAuth());
        }

        // Date filter modal
        if (this.dateFilterButton) {
            this.dateFilterButton.addEventListener('click', () => {
                this.dateFilterModal.style.display = 'block';
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.dateFilterModal) {
                this.dateFilterModal.style.display = 'none';
            }
        });

        // Close button
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.dateFilterModal.style.display = 'none';
            });
        });

        // Apply date filter
        if (this.applyDateFilterButton) {
            this.applyDateFilterButton.addEventListener('click', () => {
                const selectedDate = this.startDateInput.value;
                if (selectedDate) {
                    this.stepsTracker.setStartDate(new Date(selectedDate));
                    this.dateFilterModal.style.display = 'none';
                }
            });
        }

        // Reset date filter
        if (this.resetDateFilterButton) {
            this.resetDateFilterButton.addEventListener('click', () => {
                this.stepsTracker.resetStartDate();
                this.dateFilterModal.style.display = 'none';
            });
        }

        // Clear history
        if (this.clearHistoryButton) {
            this.clearHistoryButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all step history? This cannot be undone.')) {
                    this.stepsTracker.clearHistory();
                }
            });
        }
    }

    initialize() {
        // Check for access token in URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            localStorage.setItem('fitbit_access_token', accessToken);
            window.location.hash = ''; // Clear the hash
            this.updateConnectionStatus(true);
            this.welcomeModal.hide();
        }

        // Check for existing token
        const token = localStorage.getItem('fitbit_access_token');
        console.log('Token found:', !!token);
        
        if (token) {
            this.updateConnectionStatus(true);
            this.fetchTodaySteps();
            this.fetchStepsHistory();
        } else {
            this.updateConnectionStatus(false);
            this.welcomeModal.show();
        }

        // Initialize minimize buttons
        document.querySelectorAll('.minimize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const widget = e.target.closest('.widget');
                widget.classList.toggle('minimized');
                e.target.textContent = widget.classList.contains('minimized') ? '+' : '−';
            });
        });

        // Initialize step gauge
        this.initializeStepGauge();
    }

    initializeStepGauge() {
        const container = document.getElementById('step-gauge-container');
        if (!container) return;

        // Clear any existing content
        container.innerHTML = '';
        
        // Create new gauge
        this.stepGauge = new StepGauge('step-gauge-container');
        
        // Set initial value
        this.stepGauge.update(0, this.dailyGoal);
    }

    redirectToFitbitAuth() {
        const clientId = window.config.CLIENT_ID;
        const redirectUri = encodeURIComponent(window.config.REDIRECT_URI);
        const scope = 'activity profile heartrate sleep';
        const responseType = 'token';
        
        const authUrl = `https://www.fitbit.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
        
        console.log('Redirecting to Fitbit auth URL:', authUrl);
        window.location.href = authUrl;
    }

    async fetchTodaySteps() {
        if (!this.accessToken) {
            console.log('No access token available');
            return;
        }

        try {
            console.log('Fetching today\'s steps...');
            const response = await fetch('https://api.fitbit.com/1/user/-/activities/steps/date/today/1d.json', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Token expired or invalid');
                    localStorage.removeItem('fitbit_access_token');
                    this.accessToken = null;
                    this.updateConnectionStatus(false);
                    this.welcomeModal.show();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Steps data received:', data);
            
            const steps = data['activities-steps'][0].value;
            console.log('Today\'s steps:', steps);
            
            // Update step gauge
            this.stepGauge.update(steps, this.dailyGoal);
            
            // Add to steps tracker
            this.stepsTracker.addStepsEntry(new Date(), steps);
            
            // Check for milestones using total steps
            const totalSteps = this.stepsTracker.totalSteps;
            this.checkMilestones(totalSteps);
        } catch (error) {
            console.error('Error fetching today\'s steps:', error);
            this.stepGauge.update(0, this.dailyGoal);
            this.welcomeModal.show();
        }
    }

    async fetchStepsHistory() {
        if (!this.accessToken) {
            console.log('No access token available for history');
            return;
        }

        try {
            console.log('Fetching steps history...');
            // Get steps for the last 30 days
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];
            
            const response = await fetch(`https://api.fitbit.com/1/user/-/activities/steps/date/${formattedStartDate}/${formattedEndDate}.json`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Token expired or invalid');
                    localStorage.removeItem('fitbit_access_token');
                    this.accessToken = null;
                    this.updateConnectionStatus(false);
                    this.welcomeModal.show();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('History data received:', data);
            
            // Process each day's data
            data['activities-steps'].forEach(day => {
                const date = new Date(day.dateTime);
                const steps = parseInt(day.value);
                
                if (!isNaN(steps)) {
                    this.stepsTracker.addStepsEntry(date, steps);
                }
            });
            
        } catch (error) {
            console.error('Error fetching steps history:', error);
        }
    }

    checkMilestones(steps) {
        const milestone = this.themeManager.getMilestoneForSteps(steps);
        const milestoneContainer = document.getElementById('milestone-container');
        
        if (milestone && milestoneContainer) {
            this.themeManager.applyMilestoneStyles(milestoneContainer, milestone);
            milestoneContainer.style.display = 'block';
        } else if (milestoneContainer) {
            milestoneContainer.style.display = 'none';
        }
    }

    showError(message, type = 'error') {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.backgroundColor = type === 'success' ? '#4CAF50' : '#ff4444';
        errorDiv.textContent = message;
        document.querySelector('.container').appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    initializeSettings() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettingsBtn = document.querySelector('.close-modal');
        const disconnectBtn = document.getElementById('disconnect-fitbit');

        if (!settingsBtn || !settingsModal || !closeSettingsBtn || !disconnectBtn) {
            console.warn('Some settings elements not found in the DOM');
            return;
        }

        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'block';
            this.updateConnectionStatus(!!this.accessToken);
        });

        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });

        disconnectBtn.addEventListener('click', () => {
            this.disconnectFitbit();
        });

        window.addEventListener('click', (event) => {
            if (event.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
    }

    updateConnectionStatus(isConnected) {
        const connectionStatus = document.getElementById('connection-status');
        const disconnectButton = document.getElementById('disconnect-fitbit');
        const loginButton = document.getElementById('login-button');

        if (connectionStatus) {
            connectionStatus.textContent = isConnected ? 'Connected' : 'Not Connected';
            connectionStatus.style.color = isConnected ? '#4CAF50' : '#dc3545';
        }

        if (disconnectButton) {
            disconnectButton.style.display = isConnected ? 'block' : 'none';
        }

        if (loginButton) {
            loginButton.style.display = isConnected ? 'none' : 'block';
        }
    }

    logout() {
        localStorage.removeItem('fitbit_access_token');
        this.accessToken = null;
        this.updateConnectionStatus(false);
        document.getElementById('settings-modal').style.display = 'none';
        this.welcomeModal.show();
    }

    disconnectFitbit() {
        localStorage.removeItem('fitbit_access_token');
        this.accessToken = null;
        this.updateConnectionStatus(false);
        document.getElementById('settings-modal').style.display = 'none';
        this.welcomeModal.show();
    }
}

// Create and export the app instance
const app = new FitbitApp();
window.app = app;  // Make app accessible globally for the welcome modal
export default app;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FitbitApp();
}); 