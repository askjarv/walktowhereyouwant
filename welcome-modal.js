class WelcomeModal {
    constructor() {
        this.modal = null;
        this.initialize();
        
        // Only show the modal if there's no access token
        const accessToken = localStorage.getItem('fitbit_access_token');
        if (!accessToken) {
            this.show();
        }
    }

    initialize() {
        // Create modal HTML
        const modalHTML = `
            <div id="welcome-modal" class="modal">
                <div class="modal-content glass-effect">
                    <h2>Welcome to Walk To Where You Want</h2>
                    <p>Track your steps and unlock beautiful nature-themed milestones as you walk!</p>
                    <div class="welcome-buttons">
                        <button id="welcome-login" class="primary-button">Connect with Fitbit</button>
                        <button id="welcome-skip" class="secondary-button">Skip for now</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal elements
        this.modal = document.getElementById('welcome-modal');
        const loginButton = document.getElementById('welcome-login');
        const skipButton = document.getElementById('welcome-skip');

        // Add event listeners
        loginButton.addEventListener('click', () => {
            this.hide();
            window.app.redirectToFitbitAuth();
        });

        skipButton.addEventListener('click', () => {
            this.hide();
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

export default WelcomeModal; 