// Fitbit API credentials - You'll need to replace these with your own
const CLIENT_ID = 'YOUR_CLIENT_ID';
const REDIRECT_URI = window.location.origin;

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
                'Authorization': 'Basic ' + btoa(CLIENT_ID + ':')
            },
            body: new URLSearchParams({
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI
            })
        });

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

        const data = await response.json();
        const steps = data['activities-steps'][0].value;
        stepsCount.textContent = steps.toLocaleString();
    } catch (error) {
        console.error('Error fetching steps:', error);
        stepsCount.textContent = 'Error';
    }
}

// Handle login button click
loginButton.addEventListener('click', () => {
    const scope = 'activity';
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}`;
    window.location.href = authUrl;
});

// Initialize the app when the page loads
init(); 