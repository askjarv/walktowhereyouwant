// DOM Elements
const loginButton = document.getElementById('login-button');
const stepsCount = document.getElementById('steps-count');
const importSettingsButton = document.getElementById('import-settings');
const stepsHistory = document.getElementById('steps-history');

// Check if we have a token in localStorage
let accessToken = localStorage.getItem('fitbit_access_token');

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

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Handle settings import
importSettingsButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cfg';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const text = await file.text();
                const settings = parseConfigFile(text);
                
                // Save settings to localStorage
                Object.entries(settings).forEach(([key, value]) => {
                    localStorage.setItem(key, value);
                });
                
                showError('Settings imported successfully!', 'success');
                
                // Refresh the page to apply new settings
                window.location.reload();
            } catch (error) {
                console.error('Error importing settings:', error);
                showError('Failed to import settings. Please check the file format.');
            }
        }
    };
    
    input.click();
});

// Parse config file
function parseConfigFile(text) {
    const settings = {};
    const lines = text.split('\n');
    
    lines.forEach(line => {
        const [key, value] = line.split('=').map(s => s.trim());
        if (key && value) {
            settings[key] = value;
        }
    });
    
    return settings;
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

// Handle login button click
loginButton.addEventListener('click', () => {
    const scope = 'activity';
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${window.config.CLIENT_ID}&redirect_uri=${encodeURIComponent(window.config.REDIRECT_URI)}&scope=${scope}`;
    window.location.href = authUrl;
});

// Initialize the app when the page loads
init(); 