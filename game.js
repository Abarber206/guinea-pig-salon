// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size first
canvas.width = 1200;  // Increased from 800
canvas.height = 800;  // Increased from 600

// Get UI elements
const scoreElement = document.getElementById('scoreValue');
const roundElement = document.getElementById('roundValue');
const nextRoundElement = document.getElementById('nextRound');
const countdownElement = document.getElementById('countdownValue');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const finalRoundElement = document.getElementById('finalRound');
const themeSelect = document.getElementById('theme');
const leaderboardList = document.getElementById('leaderboardList');
const playerNameInput = document.getElementById('playerName');

// Game variables
let score = 0;
let round = 1;
let gameActive = true;
let activeCircles = 0;
let roundStartTime = Date.now();

const initialCircleCount = 3;

function getDifficultyMultipliers() {
    // Calculate the current difficulty tier (changes every 5 rounds)
    const difficultyTier = Math.floor((round - 1) / 5);
    
    // Speed increases more significantly every 5 rounds
    const baseSpeed = 0.5;  // Starting speed
    const speedIncreasePerTier = 0.2;  // Speed increase every 5 rounds
    const smallSpeedIncreasePerRound = 0.02;  // Tiny speed increase each round
    
    // Calculate speed based on tier and individual rounds
    const tierSpeedIncrease = difficultyTier * speedIncreasePerTier;
    const roundSpeedIncrease = (round - 1) * smallSpeedIncreasePerRound;
    const maxSpeedMultiplier = 3;  // Cap the maximum speed
    
    // Calculate spawn delay (decreases with tiers)
    const baseSpawnDelay = 2;
    const minSpawnDelay = 0.5;
    const spawnDelayDecrease = difficultyTier * 0.2;
    
    // Calculate max circles (increases with tiers)
    const baseCircleCount = initialCircleCount;
    const circlesPerTier = 1;
    
    return {
        speed: Math.min(baseSpeed + tierSpeedIncrease + roundSpeedIncrease, maxSpeedMultiplier),
        spawnDelay: Math.max(minSpawnDelay, baseSpawnDelay - spawnDelayDecrease),
        maxCircles: baseCircleCount + (difficultyTier * circlesPerTier)
    };
}

// Mouse position
let mouseX = 0;
let mouseY = 0;

// Circles array
const circles = [];

// Create audio context for pop sound
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function createPopSound() {
    // Create new nodes for each sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Random pitch selection from an array of frequencies
    const frequencies = [300, 400, 500, 600];
    const startFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
    
    const duration = 0.1;
    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(startFreq * 0.05, audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playPopSound() {
    try {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        createPopSound();
    } catch (error) {
        console.error('Error playing pop sound:', error);
    }
}

// Circle class
class Circle {
    constructor() {
        this.reset();
    }
    
    setRandomColor() {
        // Array of bright, balloon-like colors
        const colors = [
            { main: '#FF0000', light: '#FF8888' }, // Red
            { main: '#00FF00', light: '#88FF88' }, // Green
            { main: '#0088FF', light: '#88CCFF' }, // Blue
            { main: '#FF00FF', light: '#FF88FF' }, // Pink
            { main: '#FFFF00', light: '#FFFF88' }, // Yellow
            { main: '#FF8800', light: '#FFCC88' }, // Orange
            { main: '#8800FF', light: '#CC88FF' }, // Purple
            { main: '#00FFFF', light: '#88FFFF' }  // Cyan
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    setRandomPosition() {
        // Get a random angle
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(canvas.width, canvas.height);
        
        // Position the ball randomly around the canvas at a distance
        this.x = canvas.width/2 + Math.cos(angle) * distance;
        this.y = canvas.height/2 + Math.sin(angle) * distance;
    }

    reset() {
        // Get a random angle
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(canvas.width, canvas.height);
        
        // Position the ball randomly around the canvas at a distance
        this.x = canvas.width/2 + Math.cos(angle) * distance;
        this.y = canvas.height/2 + Math.sin(angle) * distance;
        
        // Calculate size based on round
        let minSize, maxSize;
        
        if (round < 3) {
            // Rounds 1-2: All balloons are the same large size
            minSize = maxSize = 45;
        } else {
            // After round 3: Mix of sizes based on difficulty tier
            const difficultyTier = Math.floor((round - 1) / 5);
            const baseMaxSize = 45;
            const baseMinSize = 25;
            
            // More size variation in later rounds
            const sizeVariation = Math.min(15, Math.floor((round - 3) * 1.5));
            
            // Randomly choose if this will be a large or small balloon
            if (Math.random() < 0.5) {
                // Larger balloon
                minSize = baseMaxSize - (difficultyTier * 2);
                maxSize = minSize + sizeVariation;
            } else {
                // Smaller balloon
                maxSize = baseMinSize + (difficultyTier * 2);
                minSize = Math.max(15, maxSize - sizeVariation);
            }
            
            // Ensure sizes stay within reasonable bounds
            minSize = Math.max(15, minSize);
            maxSize = Math.max(minSize + 5, Math.min(50, maxSize));
        }
        
        this.radius = minSize + Math.random() * (maxSize - minSize);
        
        // Random initial velocity with round difficulty
        const difficulty = getDifficultyMultipliers();
        const speedToCenter = (Math.random() * 0.5 + 0.5) * difficulty.speed;
        this.dx = -Math.cos(angle) * speedToCenter;
        this.dy = -Math.sin(angle) * speedToCenter;
        
        this.active = true;
        activeCircles++;
        
        // New random color and string properties
        this.setRandomColor();
        this.stringLength = 20 + Math.random() * 30;  // Random string length between 20-50
        this.stringWave = Math.random() * Math.PI * 2;  // Random starting phase for string wave
        this.stringWaveSpeed = 0.05 + Math.random() * 0.05;  // Random wave speed
        
        // Pop animation properties
        this.popPieces = [];
    }

    startPopAnimation() {
        this.popPieces = [];
        
        // Create balloon pieces for the animation
        const pieceCount = 8;
        for (let i = 0; i < pieceCount; i++) {
            const angle = (i / pieceCount) * Math.PI * 2;
            const speed = Math.random() * 2 + 3;
            this.popPieces.push({
                x: this.x,
                y: this.y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed - 2, // Initial upward velocity
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        playPopSound(); // Play pop sound when balloon is popped
    }

    deactivate() {
        if (this.active) {
            this.startPopAnimation();
            this.active = false;
            activeCircles--;
            
            // Check if round is complete
            if (activeCircles === 0) {
                startCountdown();
            } else {
                // Spawn a new circle after delay
                const difficulty = getDifficultyMultipliers();
                setTimeout(() => {
                    if (gameActive && circles.length < difficulty.maxCircles) {
                        const circle = new Circle();
                        circles.push(circle);
                    }
                }, difficulty.spawnDelay * 1000);
            }
        }
    }

    update() {
        if (!this.active) return;

        // Calculate direction towards circle center
        const targetX = targetCircle.x;
        const targetY = targetCircle.y;
        
        // Calculate angle and distance to target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Update velocity with attraction to circle
        const speedMultiplier = getDifficultyMultipliers().speed;
        const attraction = 0.05 * speedMultiplier;
        this.dx += (dx / distance) * attraction;
        this.dy += (dy / distance) * attraction;
        
        // Apply some drag to prevent extreme acceleration
        const drag = 0.99;
        this.dx *= drag;
        this.dy *= drag;

        // Update position
        this.x += this.dx;
        this.y += this.dy;

        // Update string wave
        this.stringWave += this.stringWaveSpeed;
        
        // Check collision with cursor
        const distToMouse = Math.sqrt(
            Math.pow(this.x - mouseX, 2) + Math.pow(this.y - mouseY, 2)
        );
        if (distToMouse < this.radius + 20) {
            score += 10 * round;
            scoreElement.textContent = score;
            playPopSound();
            this.deactivate();
        }

        // Check if circle enters target circle
        const distToTarget = Math.sqrt(
            Math.pow(this.x - targetCircle.x, 2) + 
            Math.pow(this.y - targetCircle.y, 2)
        );
        if (distToTarget < targetCircle.radius + this.radius) {
            gameOver();
        }
    }

    draw() {
        if (this.popPieces.length > 0) {
            // Draw pop animation
            // Draw balloon pieces
            ctx.fillStyle = this.color.main;
            for (let piece of this.popPieces) {
                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate(piece.rotation);
                
                // Draw triangular piece
                ctx.beginPath();
                ctx.moveTo(-10, -5);
                ctx.lineTo(10, 0);
                ctx.lineTo(-10, 5);
                ctx.closePath();
                ctx.fill();
                
                // Update piece position
                piece.x += piece.dx;
                piece.y += piece.dy;
                piece.dy += 0.2; // Gravity
                piece.rotation += piece.rotationSpeed;
                
                ctx.restore();
            }
            
            // Stop animation after certain frames
            if (this.popPieces.every(piece => piece.y > canvas.height)) {
                this.popPieces = [];
            }
            
            return;
        }

        if (!this.active) return;
        
        // Draw balloon
        ctx.beginPath();
        
        // Create gradient for 3D effect
        const gradient = ctx.createRadialGradient(
            this.x - this.radius/3, this.y - this.radius/3, this.radius/10,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.color.light);  // Lighter color for highlight
        gradient.addColorStop(1, this.color.main);   // Main balloon color
        
        // Draw main balloon shape
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add balloon tie at bottom
        const tieX = this.x;
        const tieY = this.y + this.radius;
        ctx.beginPath();
        ctx.moveTo(tieX - 2, tieY);
        ctx.quadraticCurveTo(tieX, tieY + 5, tieX + 2, tieY);
        ctx.fillStyle = this.color.main;
        ctx.fill();
        
        // Add balloon string
        ctx.beginPath();
        ctx.moveTo(tieX, tieY + 3);
        
        // Create wavy string effect
        const waveFrequency = 0.2;
        const waveAmplitude = 5;
        
        // Calculate wave based on time and add some variation per balloon
        const time = Date.now() * 0.003;
        const individualOffset = this.x * 0.1; // Different wave pattern for each balloon
        
        for (let i = 0; i <= this.stringLength; i += 2) {
            const waveX = tieX + Math.sin((i * waveFrequency) + time + individualOffset + this.stringWave) * waveAmplitude;
            const waveY = tieY + i;
            ctx.lineTo(waveX, waveY);
        }
        
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Add shine effect
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius/3,
            this.y - this.radius/3,
            this.radius/6,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    }
}

let countdownValue = 3;
let countdownInterval;

function startCountdown() {
    countdownValue = 3;
    nextRoundElement.style.display = 'block';
    nextRoundElement.textContent = countdownValue;
    countdownInterval = setInterval(() => {
        countdownValue--;
        if (countdownValue > 0) {
            nextRoundElement.textContent = countdownValue;
        } else if (countdownValue === 0) {
            nextRoundElement.textContent = 'Go!';
        } else {
            clearInterval(countdownInterval);
            nextRoundElement.style.display = 'none';
            startNextRound();
        }
    }, 1000);
}

function startNextRound() {
    round++;
    roundElement.textContent = round;
    
    // Show countdown
    const difficulty = getDifficultyMultipliers();
    for (let i = 0; i < difficulty.maxCircles; i++) {
        if (i >= circles.length) {
            circles.push(new Circle());
        } else {
            circles[i].reset();
        }
    }
}

function updateRoundDisplay() {
    roundElement.textContent = round;
}

// Modify CSS to position the countdown at the top center
nextRoundElement.style.position = 'absolute';
nextRoundElement.style.top = '20px';
nextRoundElement.style.left = '50%';
nextRoundElement.style.transform = 'translateX(-50%)';
nextRoundElement.style.fontSize = '48px';
nextRoundElement.style.fontWeight = 'bold';
nextRoundElement.style.color = '#FF0000';

// Call startCountdown() when ready to begin the countdown
// Example: setTimeout(startCountdown, 2000); // Start countdown after 2 seconds

const targetCircle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 40,
    lineWidth: 3,
    color: '#303030',
};

function updateTargetCircleColor(theme) {
    switch (theme) {
        case 'classic':
            targetCircle.color = '#303030'; // Dark gray
            break;
        case 'night':
            targetCircle.color = '#FFFFFF'; // White for contrast
            break;
        case 'gradient':
            targetCircle.color = '#FF6B6B'; // Pink to match gradient
            break;
        case 'grid':
            targetCircle.color = '#4ECDC4'; // Turquoise to stand out
            break;
        case 'dots':
            targetCircle.color = '#FF6B6B'; // Pink for fun contrast
            break;
        case 'space':
            targetCircle.color = '#FFFFFF'; // White for visibility
            break;
        default:
            targetCircle.color = '#303030';
    }
}

// Update circle color when theme changes
themeSelect.addEventListener('change', (e) => {
    currentTheme = e.target.value;
    updateTargetCircleColor(currentTheme);
    saveTheme(currentTheme);
});

// Pre-render moon texture
const moonTexture = {
    canvas: document.createElement('canvas'),
    ctx: null
};

function initMoonTexture() {
    moonTexture.canvas.width = targetCircle.radius * 2;
    moonTexture.canvas.height = targetCircle.radius * 2;
    moonTexture.ctx = moonTexture.canvas.getContext('2d');

    const ctx = moonTexture.ctx;
    const x = targetCircle.radius;
    const y = targetCircle.radius;

    // Moon texture
    const gradient = ctx.createRadialGradient(x, y, targetCircle.radius * 0.7, x, y, targetCircle.radius);
    gradient.addColorStop(0, '#D9D9D9'); // Light gray
    gradient.addColorStop(1, '#A9A9A9'); // Darker gray
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, moonTexture.canvas.width, moonTexture.canvas.height);

    // Craters
    for (let i = 0; i < 5; i++) {
        const craterX = x + (Math.random() - 0.5) * targetCircle.radius;
        const craterY = y + (Math.random() - 0.5) * targetCircle.radius;
        const craterRadius = Math.random() * 5 + 3;
        ctx.beginPath();
        ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#A9A9A9';
        ctx.fill();
    }
}

// Initialize moon texture
initMoonTexture();

function drawTargetCircle() {
    if (currentTheme === 'night') {
        // Draw pre-rendered moon texture as a circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(targetCircle.x, targetCircle.y, targetCircle.radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(moonTexture.canvas, targetCircle.x - targetCircle.radius, targetCircle.y - targetCircle.radius);
        ctx.restore();
    } else if (currentTheme === 'gradient') {
        // Draw sunset-colored circle
        ctx.beginPath();
        ctx.arc(targetCircle.x, targetCircle.y, targetCircle.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FF4500'; // Sunset color
        ctx.fill();
    } else {
        // Default circle
        ctx.beginPath();
        ctx.arc(targetCircle.x, targetCircle.y, targetCircle.radius, 0, Math.PI * 2);
        ctx.strokeStyle = targetCircle.color;
        ctx.lineWidth = targetCircle.lineWidth;
        ctx.stroke();
    }
}

// Initialize circles
for (let i = 0; i < initialCircleCount; i++) {
    circles.push(new Circle());
}

// Mouse move event listener
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

function gameOver() {
    gameActive = false;
    finalScoreElement.textContent = score;
    finalRoundElement.textContent = round - 1;  // Rounds completed
    gameOverScreen.style.display = 'block';
    playerNameInput.style.display = 'block';
    playerNameInput.focus();
}

function saveScore() {
    const playerName = playerNameInput.value || 'Anonymous';
    updateLeaderboard(playerName, score);
    gameOverScreen.style.display = 'none'; // Hide game over screen after submitting
    playerNameInput.style.display = 'none';
    displayLeaderboard(getLeaderboard()); // Refresh leaderboard display
}

function restartGame() {
    gameActive = true;
    score = 0;
    round = 1;
    activeCircles = 0;
    scoreElement.textContent = score;
    roundElement.textContent = round;
    gameOverScreen.style.display = 'none';
    nextRoundElement.style.display = 'none';
    
    // Reset circles
    circles.length = 0;
    for (let i = 0; i < initialCircleCount; i++) {
        circles.push(new Circle());
    }
    
    animate();
}

// Track current needle angle
let currentNeedleAngle = 0;

function findNearestBalloon() {
    let nearest = null;
    let minDist = Infinity;
    
    circles.forEach(circle => {
        if (circle.active) {
            const dx = circle.x - mouseX;
            const dy = circle.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = circle;
            }
        }
    });
    
    return nearest;
}

function drawCursor() {
    // Find nearest balloon
    const nearest = findNearestBalloon();
    
    // Calculate target angle
    let targetAngle = 0;
    if (nearest) {
        targetAngle = Math.atan2(nearest.y - mouseY, nearest.x - mouseX);
    }
    
    // Smooth angle interpolation
    const angleSpeed = 0.15; // Adjust for faster/slower turning
    const angleDiff = targetAngle - currentNeedleAngle;
    
    // Handle angle wrapping
    if (angleDiff > Math.PI) {
        currentNeedleAngle += Math.PI * 2;
    } else if (angleDiff < -Math.PI) {
        currentNeedleAngle -= Math.PI * 2;
    }
    
    currentNeedleAngle += (targetAngle - currentNeedleAngle) * angleSpeed;
    
    // Draw needle
    ctx.save();
    ctx.translate(mouseX, mouseY);
    ctx.rotate(currentNeedleAngle);
    
    // Needle shape
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(20, 0);
    ctx.lineWidth = 2;
    
    // Metallic gradient
    const gradient = ctx.createLinearGradient(-5, 0, 20, 0);
    gradient.addColorStop(0, '#808080');
    gradient.addColorStop(0.5, '#D0D0D0');
    gradient.addColorStop(1, '#808080');
    ctx.strokeStyle = gradient;
    
    ctx.stroke();
    
    // Needle eye (small circle at the base)
    ctx.beginPath();
    ctx.arc(-2, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#606060';
    ctx.fill();
    
    ctx.restore();
}

function showCursor() {
    canvas.style.cursor = 'auto';
}

function hideCursor() {
    canvas.style.cursor = 'none';
}

function startGame() {
    gameActive = true;
    hideCursor();
    animate();
}

function endGame() {
    gameActive = false;
    showCursor();
    gameOverScreen.style.display = 'block';
    finalScoreElement.textContent = score;
    finalRoundElement.textContent = round;
    canvas.style.cursor = 'auto'; // Ensure cursor is visible over the canvas
}

// Pre-render background patterns
const backgroundPatterns = {
    night: document.createElement('canvas'),
    space: document.createElement('canvas')
};

// Pre-render polka dot pattern
const polkaDotsPattern = {
    dots: []
};

function initBackgroundPatterns() {
    // Night sky pattern
    const nightCtx = backgroundPatterns.night.getContext('2d');
    backgroundPatterns.night.width = canvas.width;
    backgroundPatterns.night.height = canvas.height;
    
    // Draw night sky background
    nightCtx.fillStyle = '#000033';
    nightCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw static stars
    const starCount = 200;
    const stars = Array(starCount).fill().map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        brightness: Math.random() * 0.8 + 0.2
    }));
    
    stars.forEach(star => {
        nightCtx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        nightCtx.beginPath();
        nightCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        nightCtx.fill();
    });
    
    // Space pattern
    const spaceCtx = backgroundPatterns.space.getContext('2d');
    backgroundPatterns.space.width = canvas.width;
    backgroundPatterns.space.height = canvas.height;
    
    // Draw space background
    spaceCtx.fillStyle = '#000000';
    spaceCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw static nebulas first
    const nebulaCount = 50;
    for (let i = 0; i < nebulaCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 100 + 50;
        const hue = Math.random() * 60 + 200; // Blue to purple range
        
        spaceCtx.fillStyle = `hsla(${hue}, 70%, 50%, ${Math.random() * 0.1})`;
        spaceCtx.beginPath();
        spaceCtx.arc(x, y, size, 0, Math.PI * 2);
        spaceCtx.fill();
    }
    
    // Draw static stars on top
    const spaceStarCount = 300;
    for (let i = 0; i < spaceStarCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        
        spaceCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
        spaceCtx.beginPath();
        spaceCtx.arc(x, y, size, 0, Math.PI * 2);
        spaceCtx.fill();
    }
}

function initPolkaDotsPattern() {
    polkaDotsPattern.dots = [];
    const dotCount = 100; // Number of dots
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD700', '#8A2BE2', '#FF4500'];
    for (let i = 0; i < dotCount; i++) {
        polkaDotsPattern.dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

// Initialize patterns when the game starts
initBackgroundPatterns();
initPolkaDotsPattern();

// Theme handling
let currentTheme = 'classic';

const themes = {
    classic: {
        background: '#FFFFFF',
        draw: (ctx) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    },
    night: {
        background: '#000033',
        draw: (ctx) => {
            // Draw the pre-rendered night sky pattern
            ctx.drawImage(backgroundPatterns.night, 0, 0);
        }
    },
    gradient: {
        background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
        draw: (ctx) => {
            // Sunset gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#FF6B6B');
            gradient.addColorStop(1, '#4ECDC4');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    },
    grid: {
        background: '#FFFFFF',
        draw: (ctx) => {
            // White background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 1;
            
            const gridSize = 30;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }
    },
    dots: {
        background: '#FFFFFF',
        draw: (ctx) => {
            // White background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw pre-generated polka dots
            polkaDotsPattern.dots.forEach(dot => {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = dot.color;
                ctx.fill();
            });
        }
    },
    space: {
        background: '#000000',
        draw: (ctx) => {
            // Draw the pre-rendered space pattern
            ctx.drawImage(backgroundPatterns.space, 0, 0);
        }
    }
};

// Load saved theme from local storage
function loadTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && themes[savedTheme]) {
        currentTheme = savedTheme;
        themeSelect.value = savedTheme;
        updateTargetCircleColor(currentTheme);
    }
}

// Save theme to local storage
function saveTheme(theme) {
    localStorage.setItem('selectedTheme', theme);
}

// Initialize with saved theme
loadTheme();

// Add window resize handler to update background patterns
window.addEventListener('resize', () => {
    // Only reinitialize if canvas size actually changed
    if (backgroundPatterns.night.width !== canvas.width || 
        backgroundPatterns.night.height !== canvas.height) {
        initBackgroundPatterns();
        initPolkaDotsPattern();
    }
});

// Leaderboard management with player names
const leaderboardKey = 'gameLeaderboard';

function getLeaderboard() {
    const storedLeaderboard = localStorage.getItem(leaderboardKey);
    return storedLeaderboard ? JSON.parse(storedLeaderboard) : [];
}

function updateLeaderboard(playerName, newScore) {
    const leaderboard = getLeaderboard();
    leaderboard.push({ name: playerName, score: newScore });
    leaderboard.sort((a, b) => b.score - a.score); // Sort by score descending
    if (leaderboard.length > 5) leaderboard.pop(); // Keep top 5 scores
    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
    displayLeaderboard(leaderboard);
}

function displayLeaderboard(leaderboard) {
    leaderboardList.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(listItem);
    });
}

// Initialize leaderboard display
window.addEventListener('load', () => {
    loadTheme();
    hideCursor(); // Initially hide cursor
    initBackgroundPatterns();
    initPolkaDotsPattern();
    startGame();
    displayLeaderboard(getLeaderboard()); // Display leaderboard on load
});

function animate() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw theme background
    themes[currentTheme].draw(ctx);
    
    drawTargetCircle();
    drawCursor();
    
    circles.forEach(circle => {
        circle.update();
        circle.draw();
    });
    
    requestAnimationFrame(animate);
}

// Start the game
gameOverScreen.addEventListener('click', saveScore);

// Add click handler to start audio context
canvas.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
});
