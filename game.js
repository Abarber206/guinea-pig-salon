const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let currentTool = 'scissors';
let bodyHair = [];  // Hair for the body (visible in side view)
let faceHair = [];  // Hair for the face (visible in front view)
let currentColor = '#8B4513'; // Default brown color
let currentAccessoryColor = '#FF69B4';
let bodyColor = '#8B4513';
let accessories = {
    bow: { active: false, x: 0, y: 0, scale: 1 },
    hat: { active: false, x: 0, y: 0, scale: 1 },
    glasses: { active: false, x: 0, y: 0, scale: 1 },
    bowtie: { active: false, x: 0, y: 0, scale: 1 }
};
let spots = [];
let sparkles = [];

// List of possible guinea pig names
const guineaPigNames = [
    'Peanut', 'Cookie', 'Nibbles', 'Ginger', 'Oreo',
    'Marshmallow', 'Pepper', 'Maple', 'Cocoa', 'Biscuit',
    'Waffle', 'Mochi', 'Pudding', 'Pickles', 'Nutmeg',
    'Cinnamon', 'Popcorn', 'Cheerio', 'Noodle', 'Bean',
    'Snuggles', 'Bubbles', 'Waffles', 'Squeaks', 'Whiskers'
];

// List of possible guinea pig base colors
const guineaPigColors = [
    // Browns
    '#8B4513', '#A0522D', '#6B4423', '#8B7355', '#CD853F',
    // Greys
    '#808080', '#A9A9A9', '#696969', '#778899', '#B8860B',
    // Creams
    '#F5DEB3', '#DEB887', '#D2B48C', '#BC8F8F', '#F4A460',
    // Reds and Oranges
    '#CD5C5C', '#B8860B', '#DAA520', '#CD853F', '#D2691E'
];

let guineaPigName = '';

// Guinea pig properties
const guineaPig = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 200,
    height: 150,
    eyeSize: 8,
    noseSize: 6
};

function generateGuineaPigName() {
    guineaPigName = guineaPigNames[Math.floor(Math.random() * guineaPigNames.length)];
}

function generateRandomGuineaPigColor() {
    return guineaPigColors[Math.floor(Math.random() * guineaPigColors.length)];
}

// Helper function to add slight variation to colors
function varyColor(baseColor) {
    const r = parseInt(baseColor.substr(1,2), 16);
    const g = parseInt(baseColor.substr(3,2), 16);
    const b = parseInt(baseColor.substr(5,2), 16);
    
    const variation = 30;
    const newR = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * variation));
    const newG = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * variation));
    const newB = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * variation));
    
    return '#' + Math.round(newR).toString(16).padStart(2, '0') +
                 Math.round(newG).toString(16).padStart(2, '0') +
                 Math.round(newB).toString(16).padStart(2, '0');
}

// Helper function to darken a color
function darkenColor(color) {
    const r = parseInt(color.substr(1,2), 16);
    const g = parseInt(color.substr(3,2), 16);
    const b = parseInt(color.substr(5,2), 16);
    
    const factor = 0.8; // Darken by 20%
    const newR = Math.max(0, Math.min(255, r * factor));
    const newG = Math.max(0, Math.min(255, g * factor));
    const newB = Math.max(0, Math.min(255, b * factor));
    
    return '#' + Math.round(newR).toString(16).padStart(2, '0') +
                 Math.round(newG).toString(16).padStart(2, '0') +
                 Math.round(newB).toString(16).padStart(2, '0');
}

// Helper function to adjust color based on spot variation
function adjustColorForSpot(baseColor, spot) {
    const r = parseInt(baseColor.substr(1,2), 16);
    const g = parseInt(baseColor.substr(3,2), 16);
    const b = parseInt(baseColor.substr(5,2), 16);
    
    const factor = 0.7 + (spot.variation * 0.6); // Vary between 70% and 130% of original color
    const newR = Math.max(0, Math.min(255, r * factor));
    const newG = Math.max(0, Math.min(255, g * factor));
    const newB = Math.max(0, Math.min(255, b * factor));
    
    return '#' + Math.round(newR).toString(16).padStart(2, '0') +
                 Math.round(newG).toString(16).padStart(2, '0') +
                 Math.round(newB).toString(16).padStart(2, '0');
}

// Function to check if a point is near a spot
function getNearbySpot(x, y) {
    return spots.find(spot => {
        const dx = x - spot.x;
        const dy = y - spot.y;
        return Math.sqrt(dx * dx + dy * dy) <= spot.radius;
    });
}

// Initialize random spots
function initializeSpots() {
    spots = [];
    const numSpots = Math.floor(Math.random() * 5) + 3; // 3-7 spots
    
    for (let i = 0; i < numSpots; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * guineaPig.width * 0.3;
        const x = guineaPig.x + Math.cos(angle) * distance;
        const y = guineaPig.y + Math.sin(angle) * distance;
        
        spots.push({
            x: x,
            y: y,
            radius: Math.random() * 20 + 10,
            variation: Math.random()
        });
    }
}

function drawSpots() {
    spots.forEach(spot => {
        const spotColor = adjustColorForSpot(bodyColor, spot);
        ctx.fillStyle = spotColor;
        
        // Draw spot in front view
        if (isFrontView) {
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        // Draw spot in side view (adjust x position)
        else {
            ctx.beginPath();
            ctx.arc(
                spot.x + (spot.x > guineaPig.x ? guineaPig.width/4 : -guineaPig.width/4),
                spot.y,
                spot.radius,
                0, Math.PI * 2
            );
            ctx.fill();
        }
    });
}

// Event Handlers
function handleGrooming(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    addSparkle(mouseX, mouseY);
    
    if (currentTool === 'brush') {
        playSound('brush');
        if (isFrontView) {
            addFaceHair(mouseX, mouseY);
        } else {
            addBodyHair(mouseX, mouseY);
        }
    } else if (currentTool === 'scissors') {
        playSound('scissors');
        if (isFrontView) {
            trimFaceHair(mouseX, mouseY);
        } else {
            trimBodyHair(mouseX, mouseY);
        }
    } else if (currentTool === 'dye') {
        playSound('dye');
        if (isFrontView) {
            dyeFaceHair(mouseX, mouseY);
        } else {
            dyeBodyHair(mouseX, mouseY);
        }
    }
}

function toggleView() {
    isFrontView = !isFrontView;
    playSound('switch');
}

function updateColor(e) {
    currentColor = e.target.value;
}

function updateAccessoryColor(e) {
    currentAccessoryColor = e.target.value;
}

// Audio Functions
let audioElements = {};

function initializeAudio() {
    audioElements = {
        brush: new Audio('sounds/brush.mp3'),
        scissors: new Audio('sounds/scissors.mp3'),
        dye: new Audio('sounds/dye.mp3'),
        switch: new Audio('sounds/switch.mp3')
    };
    
    // Preload all sounds
    Object.values(audioElements).forEach(audio => {
        audio.load();
    });
}

function playSound(soundName) {
    if (audioElements[soundName]) {
        audioElements[soundName].currentTime = 0;
        audioElements[soundName].play().catch(error => {
            console.log('Audio playback failed:', error);
        });
    }
}

// Sound effects
const sounds = {
    cut: document.getElementById('cutSound'),
    brush: document.getElementById('brushSound'),
    accessory: document.getElementById('accessorySound'),
    color: document.getElementById('colorSound')
};

// Play sound with volume adjustment and duration limit
function playSoundWithCooldown(soundName) {
    const now = Date.now();
    if (!lastSoundTime[soundName] || now - lastSoundTime[soundName] >= 100) {
        playSound(soundName);
        lastSoundTime[soundName] = now;
    }
}

// View state
let isFrontView = false;

function initializeHair() {
    bodyHair = [];
    faceHair = [];
    
    // Add some initial hair
    for (let i = 0; i < 20; i++) {
        addBodyHair();
        addFaceHair();
    }
}

function addBodyHair() {
    const angle = Math.random() * Math.PI - Math.PI/2; // -90 to 90 degrees
    const x = guineaPig.x + Math.cos(angle) * (guineaPig.width/2 * 0.8);
    const y = guineaPig.y + Math.sin(angle) * (guineaPig.height/2 * 0.8);
    
    bodyHair.push({
        x: x,
        y: y,
        length: Math.random() * 15 + 10,
        angle: angle,
        color: varyColor(currentColor)
    });
}

function addFaceHair() {
    const angle = Math.random() * Math.PI * 2;
    const x = guineaPig.x + Math.cos(angle) * (guineaPig.width/2 * 0.8);
    const y = guineaPig.y + Math.sin(angle) * (guineaPig.height/2 * 0.8);
    
    faceHair.push({
        x: x,
        y: y,
        length: Math.random() * 15 + 10,
        angle: angle,
        color: varyColor(currentColor)
    });
}

function addHairAtPosition(x, y) {
    const dx = x - guineaPig.x;
    const dy = y - guineaPig.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Only add hair if within guinea pig's body
    if (distance <= guineaPig.width/2) {
        const angle = Math.atan2(dy, dx);
        
        const hair = {
            x: x,
            y: y,
            length: Math.random() * 15 + 10,
            angle: angle,
            color: varyColor(currentColor)
        };
        
        if (isFrontView) {
            faceHair.push(hair);
        } else {
            bodyHair.push(hair);
        }
        
        playSoundWithCooldown('brush');
    }
}

function drawUI() {
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(guineaPigName, guineaPig.x, 50);
}

function drawGuineaPig() {
    if (isFrontView) {
        drawFrontViewGuineaPig();
    } else {
        drawSideViewGuineaPig();
    }
}

function drawHair(hairArray) {
    hairArray.forEach(hair => {
        ctx.strokeStyle = hair.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hair.x, hair.y);
        ctx.lineTo(
            hair.x + Math.cos(hair.angle) * hair.length,
            hair.y + Math.sin(hair.angle) * hair.length
        );
        ctx.stroke();
    });
}

function drawFrontViewFace() {
    // Draw eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
        guineaPig.x - guineaPig.width/6,
        guineaPig.y,
        guineaPig.eyeSize,
        0, Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
        guineaPig.x + guineaPig.width/6,
        guineaPig.y,
        guineaPig.eyeSize,
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Draw nose
    ctx.beginPath();
    ctx.arc(
        guineaPig.x,
        guineaPig.y + guineaPig.height/6,
        guineaPig.noseSize,
        0, Math.PI * 2
    );
    ctx.fill();
}

function drawSideViewFace() {
    // Draw eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
        guineaPig.x + guineaPig.width/4,
        guineaPig.y - guineaPig.height/8,
        guineaPig.eyeSize,
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Draw nose
    ctx.beginPath();
    ctx.arc(
        guineaPig.x + guineaPig.width/2,
        guineaPig.y,
        guineaPig.noseSize,
        0, Math.PI * 2
    );
    ctx.fill();
}

function drawFrontViewGuineaPig() {
    // Draw body (circle)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(
        guineaPig.x,
        guineaPig.y,
        guineaPig.height/2,
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Draw spots
    drawSpots();
    
    // Draw hair
    drawHair(faceHair);
    
    // Draw face
    drawFrontViewFace();
    
    // Draw accessories
    if (accessories.glasses.active) drawGlasses();
    if (accessories.hat.active) drawHat();
    if (accessories.bow.active) drawBow();
    if (accessories.bowtie.active) drawBowtie();
}

function drawSideViewGuineaPig() {
    // Draw body (ellipse)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(
        guineaPig.x,
        guineaPig.y,
        guineaPig.width/2,
        guineaPig.height/2,
        0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Draw spots
    drawSpots();
    
    // Draw hair
    drawHair(bodyHair);
    
    // Draw face
    drawSideViewFace();
}

function drawGlasses() {
    const x = isFrontView ? guineaPig.x : guineaPig.x + guineaPig.width/4;
    const y = isFrontView ? guineaPig.y : guineaPig.y - guineaPig.height/8;
    
    ctx.strokeStyle = currentAccessoryColor;
    ctx.lineWidth = 3;
    
    if (isFrontView) {
        // Left lens
        ctx.beginPath();
        ctx.arc(x - guineaPig.width/6, y, guineaPig.eyeSize * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Right lens
        ctx.beginPath();
        ctx.arc(x + guineaPig.width/6, y, guineaPig.eyeSize * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Bridge
        ctx.beginPath();
        ctx.moveTo(x - guineaPig.width/6 + guineaPig.eyeSize, y);
        ctx.lineTo(x + guineaPig.width/6 - guineaPig.eyeSize, y);
        ctx.stroke();
    } else {
        // Side lens
        ctx.beginPath();
        ctx.arc(x, y, guineaPig.eyeSize * 1.5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawHat() {
    const x = isFrontView ? guineaPig.x : guineaPig.x + guineaPig.width/4;
    const y = isFrontView ? guineaPig.y - guineaPig.height/2 : guineaPig.y - guineaPig.height/2;
    const width = isFrontView ? guineaPig.width/2 : guineaPig.width/3;
    const height = guineaPig.height/4;
    
    ctx.fillStyle = currentAccessoryColor;
    ctx.strokeStyle = darkenColor(currentAccessoryColor);
    ctx.lineWidth = 2;
    
    // Draw brim
    ctx.beginPath();
    ctx.ellipse(x, y + height/2, width/1.5, height/4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw top
    ctx.beginPath();
    ctx.ellipse(x, y + height/4, width/2, height/4, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x - width/2, y + height/4);
    ctx.lineTo(x - width/2, y - height/2);
    ctx.lineTo(x + width/2, y - height/2);
    ctx.lineTo(x + width/2, y + height/4);
    ctx.fill();
    ctx.stroke();
    
    // Draw top circle
    ctx.beginPath();
    ctx.ellipse(x, y - height/2, width/2, height/4, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw band
    ctx.fillStyle = darkenColor(currentAccessoryColor);
    ctx.beginPath();
    ctx.rect(x - width/2, y, width, height/4);
    ctx.fill();
}

function drawBow() {
    const x = isFrontView ? guineaPig.x : guineaPig.x - guineaPig.width/4;
    const y = isFrontView ? guineaPig.y - guineaPig.height/2 : guineaPig.y - guineaPig.height/2;
    const size = guineaPig.height/4;
    
    ctx.fillStyle = currentAccessoryColor;
    ctx.strokeStyle = darkenColor(currentAccessoryColor);
    ctx.lineWidth = 2;
    
    // Draw left loop
    ctx.beginPath();
    ctx.ellipse(x - size/2, y, size/2, size/4, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw right loop
    ctx.beginPath();
    ctx.ellipse(x + size/2, y, size/2, size/4, -Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw center knot
    ctx.beginPath();
    ctx.arc(x, y, size/4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function drawBowtie() {
    const x = isFrontView ? guineaPig.x : guineaPig.x + guineaPig.width/4;
    const y = isFrontView ? guineaPig.y + guineaPig.height/3 : guineaPig.y + guineaPig.height/4;
    const size = guineaPig.height/4;
    
    ctx.fillStyle = currentAccessoryColor;
    ctx.strokeStyle = darkenColor(currentAccessoryColor);
    ctx.lineWidth = 2;
    
    // Draw left triangle
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size, y - size/2);
    ctx.lineTo(x - size, y + size/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw right triangle
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y - size/2);
    ctx.lineTo(x + size, y + size/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw center knot
    ctx.beginPath();
    ctx.arc(x, y, size/4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function clearCanvas() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    clearCanvas();
    drawUI();
    drawGuineaPig();
    drawSparkles();
}

function update() {
    updateSparkles();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function initializeCanvas() {
    canvas.width = 800;
    canvas.height = 600;
    
    // Center the guinea pig
    guineaPig.x = canvas.width / 2;
    guineaPig.y = canvas.height / 2;
}

function initializeGame() {
    // Initialize canvas
    initializeCanvas();
    
    // Generate random spots
    initializeSpots();
    
    // Generate random name
    guineaPigName = guineaPigNames[Math.floor(Math.random() * guineaPigNames.length)];
    
    // Start game loop
    gameLoop();
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleGrooming);
    document.getElementById('viewToggle').addEventListener('click', toggleView);
    document.getElementById('colorPicker').addEventListener('change', updateColor);
    document.getElementById('accessoryColorPicker').addEventListener('change', updateAccessoryColor);
    
    // Initialize audio
    initializeAudio();
}

// Animation and Effects
function addSparkle(x, y) {
    const sparkle = {
        x,
        y,
        size: 10,
        alpha: 1,
        angle: Math.random() * Math.PI * 2
    };
    sparkles.push(sparkle);
}

function updateSparkles() {
    for (let i = sparkles.length - 1; i >= 0; i--) {
        const sparkle = sparkles[i];
        sparkle.alpha -= 0.05;
        sparkle.size += 0.5;
        if (sparkle.alpha <= 0) {
            sparkles.splice(i, 1);
        }
    }
}

function drawSparkles() {
    sparkles.forEach(sparkle => {
        ctx.save();
        ctx.translate(sparkle.x, sparkle.y);
        ctx.rotate(sparkle.angle);
        ctx.globalAlpha = sparkle.alpha;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        
        // Draw star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x = Math.cos(angle) * sparkle.size;
            const y = Math.sin(angle) * sparkle.size;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    });
}

// Start the game when the window loads
window.addEventListener('load', initializeGame);
