class StepsTracker {
    constructor() {
        this.totalSteps = 0;
        this.stepsHistory = [];
        this.startDate = null;
        this.loadSavedData();
    }

    loadSavedData() {
        // Load saved steps history
        const savedHistory = localStorage.getItem('stepsHistory');
        if (savedHistory) {
            try {
                this.stepsHistory = JSON.parse(savedHistory);
                this.calculateTotalSteps();
            } catch (error) {
                console.error('Error loading saved steps history:', error);
                this.stepsHistory = [];
            }
        }

        // Load saved start date
        const savedStartDate = localStorage.getItem('stepsStartDate');
        if (savedStartDate) {
            this.startDate = new Date(savedStartDate);
        }
    }

    saveData() {
        localStorage.setItem('stepsHistory', JSON.stringify(this.stepsHistory));
        if (this.startDate) {
            localStorage.setItem('stepsStartDate', this.startDate.toISOString());
        }
    }

    setStartDate(date) {
        this.startDate = date;
        this.saveData();
        this.calculateTotalSteps();
        this.updateUI();
    }

    addStepsEntry(date, steps) {
        // Check if we already have an entry for this date
        const existingEntryIndex = this.stepsHistory.findIndex(entry => 
            new Date(entry.date).toDateString() === new Date(date).toDateString()
        );

        if (existingEntryIndex >= 0) {
            // Update existing entry
            this.stepsHistory[existingEntryIndex].steps = steps;
        } else {
            // Add new entry
            this.stepsHistory.push({ date, steps });
        }

        // Sort entries by date (newest first)
        this.stepsHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.saveData();
        this.calculateTotalSteps();
        this.updateUI();
    }

    calculateTotalSteps() {
        if (!this.startDate) {
            // If no start date is set, sum all steps
            this.totalSteps = this.stepsHistory.reduce((total, entry) => total + entry.steps, 0);
        } else {
            // Sum steps from start date onwards
            this.totalSteps = this.stepsHistory
                .filter(entry => new Date(entry.date) >= this.startDate)
                .reduce((total, entry) => total + entry.steps, 0);
        }
    }

    getFilteredHistory() {
        if (!this.startDate) {
            return this.stepsHistory;
        }
        return this.stepsHistory.filter(entry => new Date(entry.date) >= this.startDate);
    }

    updateUI() {
        // Update total steps display
        const totalStepsElement = document.getElementById('total-steps-count');
        if (totalStepsElement) {
            totalStepsElement.textContent = this.totalSteps.toLocaleString();
        }

        // Update start date display
        const startDateElement = document.getElementById('start-date-display');
        if (startDateElement) {
            if (this.startDate) {
                startDateElement.textContent = this.startDate.toLocaleDateString();
            } else {
                startDateElement.textContent = 'All time';
            }
        }

        // Update history display
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyContainer = document.getElementById('steps-history');
        if (!historyContainer) return;

        // Clear existing history
        historyContainer.innerHTML = '';

        // Get filtered history
        const filteredHistory = this.getFilteredHistory();

        // Add history items
        filteredHistory.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const date = new Date(entry.date);
            const formattedDate = date.toLocaleDateString();
            
            historyItem.innerHTML = `
                <span class="history-date">${formattedDate}</span>
                <span class="history-steps">${entry.steps.toLocaleString()} steps</span>
            `;
            
            historyContainer.appendChild(historyItem);
        });

        // Show message if no history
        if (filteredHistory.length === 0) {
            const noHistoryMessage = document.createElement('div');
            noHistoryMessage.className = 'no-history-message';
            noHistoryMessage.textContent = 'No step history available';
            historyContainer.appendChild(noHistoryMessage);
        }
    }

    clearHistory() {
        this.stepsHistory = [];
        this.totalSteps = 0;
        this.saveData();
        this.updateUI();
    }

    resetStartDate() {
        this.startDate = null;
        this.saveData();
        this.calculateTotalSteps();
        this.updateUI();
    }
}

export default StepsTracker; 