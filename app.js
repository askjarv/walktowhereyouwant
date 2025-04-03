// DOM Elements
const loginButton = document.getElementById('login-button');
const stepsCount = document.getElementById('steps-count');

// Check if we have a token in localStorage
let accessToken = localStorage.getItem('fitbit_access_token');

// Initialize the app
function init() {
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
                showError('Your session has expired. Please reconnect with Fitbit.');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const steps = data['activities-steps'][0].value;
        stepsCount.textContent = steps.toLocaleString();
    } catch (error) {
        console.error('Error fetching steps:', error);
        stepsCount.textContent = 'Error';
        showError('Failed to fetch steps data. Please try again.');
    }
}

// Show error message to user
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
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