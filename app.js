import ThemeManager from './theme-manager.js';
import StepsTracker from './steps-tracker.js';

// DOM Elements
const loginButton = document.getElementById('login-button');
const stepsCount = document.getElementById('steps-count');
const importSettingsButton = document.getElementById('import-settings');
const stepsHistory = document.getElementById('steps-history');

// Check if we have a token in localStorage
let accessToken = localStorage.getItem('fitbit_access_token');

class FitbitApp {
    constructor() {
        this.themeManager = new ThemeManager();
        this.stepsTracker = new StepsTracker();
        this.accessToken = localStorage.getItem('fitbit_access_token');
        this.initializeUI();
        this.initializeEventListeners();
    }

    initializeUI() {
        // Initialize date filter modal
        this.dateFilterModal = document.getElementById('date-filter-modal');
        this.dateFilterButton = document.getElementById('date-filter-button');
        this.startDateInput = document.getElementById('start-date');
        this.applyDateFilterButton = document.getElementById('apply-date-filter');
        this.resetDateFilterButton = document.getElementById('reset-date-filter');
        this.clearHistoryButton = document.getElementById('clear-history');
        
        // Set today's date as max date for the date picker
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        this.startDateInput.max = formattedToday;
    }

    initializeEventListeners() {
        // Date filter modal
        this.dateFilterButton.addEventListener('click', () => {
            this.dateFilterModal.style.display = 'block';
        });

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
        this.applyDateFilterButton.addEventListener('click', () => {
            const selectedDate = this.startDateInput.value;
            if (selectedDate) {
                this.stepsTracker.setStartDate(new Date(selectedDate));
                this.dateFilterModal.style.display = 'none';
            }
        });

        // Reset date filter
        this.resetDateFilterButton.addEventListener('click', () => {
            this.stepsTracker.resetStartDate();
            this.dateFilterModal.style.display = 'none';
        });

        // Clear history
        this.clearHistoryButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all step history? This cannot be undone.')) {
                this.stepsTracker.clearHistory();
            }
        });

        // Login button
        const loginButton = document.getElementById('login-button');
        loginButton.addEventListener('click', () => {
            this.redirectToFitbitAuth();
        });
    }

    async initialize() {
        // Check if we have a token
        if (this.accessToken) {
            try {
                // Verify token is still valid
                await this.fetchTodaySteps();
            } catch (error) {
                console.error('Error verifying token:', error);
                // Token might be expired, clear it
                localStorage.removeItem('fitbit_access_token');
                this.accessToken = null;
            }
        }
    }

    redirectToFitbitAuth() {
        const clientId = '23R9QX';
        const redirectUri = encodeURIComponent('https://chrisbrownie.github.io/walkToWhereYouWant/callback.html');
        const scope = 'activity';
        const responseType = 'code';
        
        const authUrl = `https://www.fitbit.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
        
        window.location.href = authUrl;
    }

    async fetchTodaySteps() {
        if (!this.accessToken) return;

        try {
            const response = await fetch('https://api.fitbit.com/1/user/-/activities/date/today.json', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const steps = data.summary.steps;
            
            // Update today's steps display
            const stepsCountElement = document.getElementById('steps-count');
            if (stepsCountElement) {
                stepsCountElement.textContent = steps.toLocaleString();
            }
            
            // Add to steps tracker
            this.stepsTracker.addStepsEntry(new Date(), steps);
            
            // Check for milestones
            this.checkMilestones(steps);
            
            return steps;
        } catch (error) {
            console.error('Error fetching steps:', error);
            throw error;
        }
    }

    async fetchStepsHistory() {
        if (!this.accessToken) return;

        try {
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
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
        
        if (milestone) {
            this.themeManager.applyMilestoneStyles(milestoneContainer, milestone);
            milestoneContainer.style.display = 'block';
        } else {
            milestoneContainer.style.display = 'none';
        }
    }
}

// Initialize the app
const app = new FitbitApp();
app.initialize();

// Initialize the app
function init() {
    // Show/hide login button based on authentication status
    loginButton.style.display = accessToken ? 'none' : 'block';
    
    // Check if we're returning from Fitbit authorization
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // Exchange the authorization code for an access token
        exchangeCodeForToken(code);
    } else if (accessToken) {
        // If we have a token, fetch the steps
        fetchSteps();
    }

    // Load and display step history
    displayStepHistory();
}

// Exchange authorization code for access token
async function exchangeCodeForToken(code) {
    try {
        const response = await fetch('https://api.fitbit.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(window.config.CLIENT_ID + ':' + window.config.CLIENT_SECRET)
            },
            body: new URLSearchParams({
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: window.config.REDIRECT_URI
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        localStorage.setItem('fitbit_access_token', accessToken);
        
        // Remove the code from the URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Hide login button
        loginButton.style.display = 'none';
        
        // Fetch the steps
        fetchSteps();
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        stepsCount.textContent = 'Error';
        showError('Failed to authenticate with Fitbit. Please try again.');
    }
}

// Fetch steps from Fitbit API
async function fetchSteps() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`https://api.fitbit.com/1/user/-/activities/steps/date/today/1d.json`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('fitbit_access_token');
                accessToken = null;
                loginButton.style.display = 'block';
                showError('Your session has expired. Please reconnect with Fitbit.');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const steps = data['activities-steps'][0].value;
        stepsCount.textContent = steps.toLocaleString();
        
        // Save steps to history
        saveStepsToHistory(today, steps);
        
        // Update history display
        displayStepHistory();
    } catch (error) {
        console.error('Error fetching steps:', error);
        stepsCount.textContent = 'Error';
        showError('Failed to fetch steps data. Please try again.');
    }
}

// Save steps to history
function saveStepsToHistory(date, steps) {
    let history = JSON.parse(localStorage.getItem('steps_history') || '{}');
    history[date] = steps;
    localStorage.setItem('steps_history', JSON.stringify(history));
}

// Display step history
function displayStepHistory() {
    const history = JSON.parse(localStorage.getItem('steps_history') || '{}');
    const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
    
    stepsHistory.innerHTML = sortedDates.map(date => `
        <div class="history-item">
            <span class="history-date">${formatDate(date)}</span>
            <span class="history-steps">${history[date].toLocaleString()} steps</span>
        </div>
    `).join('');
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Show error message to user
function showError(message, type = 'error') {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.backgroundColor = type === 'success' ? '#4CAF50' : '#ff4444';
    errorDiv.textContent = message;
    document.querySelector('.container').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Initialize the app when the page loads
init(); 