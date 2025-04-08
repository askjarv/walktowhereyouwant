class StepGauge {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.initialize();
    }

    initialize() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = 300;
        this.canvas.height = 300;
        this.container.appendChild(this.canvas);
        
        // Get context
        this.ctx = this.canvas.getContext('2d');
        
        // Initial render
        this.render(0, 10000); // Default to 10,000 steps goal
    }

    render(steps, goal) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.4;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 20;
        ctx.stroke();
        
        // Calculate progress
        const progress = Math.min(steps / goal, 1);
        const angle = Math.PI * (1 - progress);
        
        // Draw progress arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, angle);
        ctx.strokeStyle = `hsl(${120 * progress}, 70%, 50%)`;
        ctx.lineWidth = 20;
        ctx.stroke();
        
        // Draw steps text
        ctx.fillStyle = 'var(--text-color)';
        ctx.font = 'bold 24px var(--font-family)';
        ctx.textAlign = 'center';
        ctx.fillText(steps.toLocaleString(), centerX, centerY + 10);
        
        // Draw goal text
        ctx.font = '16px var(--font-family)';
        ctx.fillText(`Goal: ${goal.toLocaleString()}`, centerX, centerY + 40);
        
        // Draw percentage
        const percentage = Math.round(progress * 100);
        ctx.font = '20px var(--font-family)';
        ctx.fillText(`${percentage}%`, centerX, centerY - 20);
    }

    update(steps, goal) {
        this.render(steps, goal);
    }
}

export default StepGauge; 