const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let currentTool = 'scissors';
let bodyHair = [];  // Hair for the body (visible in side view)
let faceHair = [];  // Hair for the face (visible in front view)
let currentColor = '#8B4513'; // Default brown color
let currentAccessoryColor = '#FF69B4';
let bodyColor = '#8B4513';
let isMouseDown = false;
let zoomLevel = 1;
let canvasScale = {
    x: 1,
    y: 1
};

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

function generateGuineaPigName() {
    guineaPigName = guineaPigNames[Math.floor(Math.random() * guineaPigNames.length)];
}

function generateRandomGuineaPigColor() {
    return guineaPigColors[Math.floor(Math.random() * guineaPigColors.length)];
}

// Helper function to add slight variation to colors
function varyColor(baseColor) {
    // Convert hex to RGB
    const r = parseInt(baseColor.slice(1,3), 16);
    const g = parseInt(baseColor.slice(3,5), 16);
    const b = parseInt(baseColor.slice(5,7), 16);
    
    // Add random variation (-15 to +15)
    const variation = () => Math.floor(Math.random() * 31) - 15;
    
    // Apply variation and ensure values stay in valid range (0-255)
    const newR = Math.min(255, Math.max(0, r + variation()));
    const newG = Math.min(255, Math.max(0, g + variation()));
    const newB = Math.min(255, Math.max(0, b + variation()));
    
    // Convert back to hex
    return '#' + [newR, newG, newB].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Helper function to darken a color
function darkenColor(color) {
    const r = parseInt(color.slice(1,3), 16);
    const g = parseInt(color.slice(3,5), 16);
    const b = parseInt(color.slice(5,7), 16);
    
    // Darken by 20%
    const darkenAmount = 0.8;
    const newR = Math.floor(r * darkenAmount);
    const newG = Math.floor(g * darkenAmount);
    const newB = Math.floor(b * darkenAmount);
    
    return '#' + [newR, newG, newB].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Helper function to adjust color based on spot variation
function adjustColorForSpot(baseColor, spot) {
    const r = parseInt(baseColor.slice(1,3), 16);
    const g = parseInt(baseColor.slice(3,5), 16);
    const b = parseInt(baseColor.slice(5,7), 16);
    
    const newR = Math.min(255, Math.max(0, Math.floor(r * spot.variation)));
    const newG = Math.min(255, Math.max(0, Math.floor(g * spot.variation)));
    const newB = Math.min(255, Math.max(0, Math.floor(b * spot.variation)));
    
    return '#' + [newR, newG, newB].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Helper function to lighten/darken color based on spot
function adjustColorForSpotOld(baseColor, isDark) {
    const r = parseInt(baseColor.slice(1,3), 16);
    const g = parseInt(baseColor.slice(3,5), 16);
    const b = parseInt(baseColor.slice(5,7), 16);
    
    // Adjust by 30% lighter or darker
    const factor = isDark ? 0.7 : 1.3;
    
    const newR = Math.min(255, Math.max(0, Math.floor(r * factor)));
    const newG = Math.min(255, Math.max(0, Math.floor(g * factor)));
    const newB = Math.min(255, Math.max(0, Math.floor(b * factor)));
    
    return '#' + [newR, newG, newB].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Helper function to check if a point is near a spot
function getNearbySpot(x, y) {
    const checkSpots = spots.filter(spot => {
        const spotX = isFrontView ? spot.frontX : spot.sideX;
        const spotY = isFrontView ? spot.frontY : spot.sideY;
        const distance = Math.sqrt(Math.pow(x - spotX, 2) + Math.pow(y - spotY, 2));
        return distance <= spot.radius + 5; // Add 5px tolerance
    });
    return checkSpots[0]; // Return the first matching spot or undefined
}

// Helper function to check if a point is within ear regions
function isInEarRegion(x, y) {
    if (isFrontView) {
        // Front view ear regions (two circles on either side)
        const leftEarCenter = { x: canvas.width/2 - 80, y: canvas.height/2 - 40 };
        const rightEarCenter = { x: canvas.width/2 + 80, y: canvas.height/2 - 40 };
        const earRadius = 40;

        return (Math.pow(x - leftEarCenter.x, 2) + Math.pow(y - leftEarCenter.y, 2) <= Math.pow(earRadius, 2)) ||
               (Math.pow(x - rightEarCenter.x, 2) + Math.pow(y - rightEarCenter.y, 2) <= Math.pow(earRadius, 2));
    } else {
        // Side view ear region (oval shape)
        const earCenter = { x: canvas.width/2 + 60, y: canvas.height/2 - 40 };
        const a = 40; // horizontal radius
        const b = 50; // vertical radius
        
        return Math.pow(x - earCenter.x, 2)/(a*a) + Math.pow(y - earCenter.y, 2)/(b*b) <= 1;
    }
}

// Helper function to adjust color for ears
function adjustColorForEars(baseColor) {
    const variation = Math.random() < 0.5 ? 0.85 : 1.15; // Randomly darker or lighter
    
    // Convert hex to RGB
    const r = parseInt(baseColor.slice(1,3), 16);
    const g = parseInt(baseColor.slice(3,5), 16);
    const b = parseInt(baseColor.slice(5,7), 16);
    
    // Adjust each component
    const newR = Math.min(255, Math.max(0, Math.round(r * variation)));
    const newG = Math.min(255, Math.max(0, Math.round(g * variation)));
    const newB = Math.min(255, Math.max(0, Math.round(b * variation)));
    
    // Convert back to hex
    return '#' + [newR, newG, newB].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Helper function to check if a point is on the guinea pig
function isOnGuineaPig(x, y) {
    const dx = (x - guineaPig.x);
    const dy = (y - guineaPig.y);

    if (isFrontView) {
        // For front view, use circular body and oval head
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        // Body (circle)
        if (distanceFromCenter <= guineaPig.height / 2.5) {
            return true;
        }
        
        // Head (oval)
        const headCenter = { x: guineaPig.x, y: guineaPig.y - guineaPig.height / 4 };
        const headDx = (x - headCenter.x);
        const headDy = (y - headCenter.y);
        const normalizedHeadX = headDx / (guineaPig.width / 3);
        const normalizedHeadY = headDy / (guineaPig.height / 4);
        if ((normalizedHeadX * normalizedHeadX + normalizedHeadY * normalizedHeadY) <= 1) {
            return true;
        }
    } else {
        // For side view, use oval body shape
        const normalizedX = dx / (guineaPig.width / 2);
        const normalizedY = dy / (guineaPig.height / 2.2);
        if ((normalizedX * normalizedX + normalizedY * normalizedY) <= 1) {
            return true;
        }
    }
    
    return false;
}

// Helper function to check if a point is on the guinea pig's body (not head)
function isOnGuineaPigBody(x, y) {
    const dx = (x - guineaPig.x);
    const dy = (y - guineaPig.y);

    if (isFrontView) {
        // For front view, use circular body only
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        // Body (circle)
        if (distanceFromCenter <= guineaPig.height / 2.5 && 
            y > guineaPig.y - guineaPig.height / 4) { // Exclude head area
            return true;
        }
    } else {
        // For side view, use oval body shape, excluding head area
        const normalizedX = dx / (guineaPig.width / 2);
        const normalizedY = dy / (guineaPig.height / 2.2);
        
        // Check if point is in body oval and not in head area (front 25% of body)
        if ((normalizedX * normalizedX + normalizedY * normalizedY) <= 1 && 
            x < guineaPig.x + guineaPig.width / 4) {
            return true;
        }
    }
    
    return false;
}

// Initialize random spots
function initializeSpots() {
    spots = [];
    const numSpots = Math.floor(Math.random() * 10) + 5; // 5-15 spots
    
    // Create spots for both views
    for (let i = 0; i < numSpots; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.8; // Keep within body
        
        // Side view spots
        const sideX = guineaPig.x + Math.cos(angle) * (guineaPig.width/2) * radius;
        const sideY = guineaPig.y + Math.sin(angle) * (guineaPig.height/2) * radius;
        
        // Front view spots (circular distribution)
        const frontRadius = guineaPig.height/1.5 * radius;
        const frontX = guineaPig.x + Math.cos(angle) * frontRadius;
        const frontY = guineaPig.y + Math.sin(angle) * frontRadius;
        
        // Random brightness (0 for dark, 1 for light)
        const isDark = Math.random() < 0.5;
        // Set a fixed variation for light spots
        const variation = isDark ? 0.7 : 1.15;
        
        spots.push({
            sideX, sideY,
            frontX, frontY,
            radius: Math.random() * 8 + 4, // 4-12px radius
            isDark,
            variation
        });
    }
}

function drawSpots() {
    spots.forEach(spot => {
        const x = isFrontView ? spot.frontX : spot.sideX;
        const y = isFrontView ? spot.frontY : spot.sideY;
        
        // Use the spot's fixed variation instead of random variation
        const r = parseInt(bodyColor.slice(1,3), 16);
        const g = parseInt(bodyColor.slice(3,5), 16);
        const b = parseInt(bodyColor.slice(5,7), 16);
        
        const newR = Math.min(255, Math.max(0, Math.floor(r * spot.variation)));
        const newG = Math.min(255, Math.max(0, Math.floor(g * spot.variation)));
        const newB = Math.min(255, Math.max(0, Math.floor(b * spot.variation)));
        
        const spotColor = '#' + [newR, newG, newB].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
        
        ctx.fillStyle = spotColor;
        ctx.beginPath();
        ctx.arc(x, y, spot.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function addHairAtPosition(x, y) {
    const dx = (x - guineaPig.x);
    const dy = (y - guineaPig.y);
    const spot = getNearbySpot(x, y);
    
    if (isFrontView) {
        // Very short hair for body, slightly longer for head
        const hairLength = isOnGuineaPigBody(x, y) ? 
            Math.random() * 3 + 2 : // 2-5 pixels for body
            Math.random() * 5 + 3;  // 3-8 pixels for head
        
        const angle = Math.atan2(dy, dx);
        const curliness = Math.random() * 0.3; // Less curly
        
        if (isOnGuineaPigBody(x, y) || isOnGuineaPig(x, y)) {
            faceHair.push({
                x: x,
                y: y,
                angle: angle,
                length: hairLength,
                cut: false,
                curliness: curliness,
                color: spot ? adjustColorForSpot(currentColor, spot) : 
                      (isInEarRegion(x, y) ? adjustColorForEars(currentColor) : varyColor(currentColor))
            });
            return true;
        }
    } else {
        // Side view - very short hair for body
        if (isOnGuineaPigBody(x, y)) {
            const hairLength = Math.random() * 3 + 2; // 2-5 pixels
            const angle = Math.atan2(dy, dx);
            const curliness = Math.random() * 0.3; // Less curly
            
            bodyHair.push({
                x: x,
                y: y,
                angle: angle,
                length: hairLength,
                cut: false,
                curliness: curliness,
                color: spot ? adjustColorForSpot(currentColor, spot) : varyColor(currentColor)
            });
            return true;
        }
    }
    return false;
}

// Sound effects
const sounds = {
    cut: document.getElementById('cutSound'),
    brush: document.getElementById('brushSound'),
    accessory: document.getElementById('accessorySound'),
    color: document.getElementById('colorSound')
};

// Play sound with volume adjustment and duration limit
function playSound(soundName) {
    const sound = sounds[soundName];
    sound.volume = 0.3; // Adjust volume to 30%
    sound.currentTime = 0;
    // Set the duration to play only the first 0.2 seconds of the sound
    setTimeout(() => {
        sound.pause();
        sound.currentTime = 0;
    }, 200);
    sound.play().catch(e => console.log('Sound play failed:', e));
}

// Add a cooldown system for sounds
let lastSoundTime = {};
function playSoundWithCooldown(soundName) {
    const now = Date.now();
    if (!lastSoundTime[soundName] || now - lastSoundTime[soundName] > 300) {
        playSound(soundName);
        lastSoundTime[soundName] = now;
    }
}

// View state
let isFrontView = false;

// Guinea pig properties
const guineaPig = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 200,
    height: 120,
    happiness: 100
};

// Hair properties
const HAIR_LENGTH = 5; // Reduced from default value
const HAIR_DENSITY = 50; // Reduced since we now have two collections

// Initialize hair on the guinea pig
function initializeHair() {
    bodyHair = [];
    faceHair = [];
    // Initialize body hair
    for (let i = 0; i < HAIR_DENSITY; i++) {
        addBodyHair();
    }
    // Initialize face hair
    for (let i = 0; i < HAIR_DENSITY/2; i++) {
        addFaceHair();
    }
}

function addBodyHair() {
    const angle = Math.random() * Math.PI * 2;
    const radiusX = (guineaPig.width / 2) * Math.sqrt(Math.random()) * 0.8;
    const radiusY = (guineaPig.height / 2) * Math.sqrt(Math.random()) * 0.8;
    
    const x = guineaPig.x + Math.cos(angle) * radiusX;
    const y = guineaPig.y + Math.sin(angle) * radiusY;
    
    bodyHair.push({
        x: x,
        y: y,
        angle: angle,
        length: HAIR_LENGTH,
        cut: false,
        color: varyColor(currentColor)
    });
}

function addFaceHair() {
    const angle = Math.random() * Math.PI * 2;
    const radius = (guineaPig.height / 1.5) * Math.sqrt(Math.random()) * 0.8;
    
    const x = guineaPig.x + Math.cos(angle) * radius;
    const y = guineaPig.y + Math.sin(angle) * radius;
    
    faceHair.push({
        x: x,
        y: y,
        angle: angle, // Hair grows outward from center
        length: HAIR_LENGTH,
        cut: false,
        color: varyColor(currentColor)
    });
}

function handleGrooming(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    let actionTaken = false;
    const currentHairArray = isFrontView ? faceHair : bodyHair;

    switch(currentTool) {
        case 'scissors':
            currentHairArray.forEach(hair => {
                const distance = Math.sqrt(
                    Math.pow(x - hair.x, 2) + Math.pow(y - hair.y, 2)
                );
                
                if (distance < 20 && !hair.cut) {
                    hair.cut = true;
                    actionTaken = true;
                }
            });
            if (actionTaken) playSoundWithCooldown('cut');
            break;

        case 'brush':
            // Add 3 hairs at slightly offset positions for a fuller brush stroke
            for (let i = 0; i < 3; i++) {
                const offsetX = x + (Math.random() - 0.5) * 10;
                const offsetY = y + (Math.random() - 0.5) * 10;
                if (addHairAtPosition(offsetX, offsetY)) {
                    actionTaken = true;
                    if (i === 0) playSoundWithCooldown('brush');
                }
            }
            break;

        case 'dye':
            let colorChanged = false;
            currentHairArray.forEach(hair => {
                if (!hair.cut && hair.color !== currentColor) {
                    const spot = getNearbySpot(hair.x, hair.y);
                    hair.color = spot ? adjustColorForSpot(currentColor, spot) : varyColor(currentColor);
                    colorChanged = true;
                    actionTaken = true;
                }
            });
            if (colorChanged) playSoundWithCooldown('color');
            break;

        case 'paintbrush':
            let painted = false;
            currentHairArray.forEach(hair => {
                const distance = Math.sqrt(
                    Math.pow(x - hair.x, 2) + Math.pow(y - hair.y, 2)
                );
                
                if (distance < 20 && !hair.cut && hair.color !== currentColor) {
                    const spot = getNearbySpot(hair.x, hair.y);
                    hair.color = spot ? adjustColorForSpot(currentColor, spot) : varyColor(currentColor);
                    painted = true;
                    actionTaken = true;
                }
            });
            if (painted) playSoundWithCooldown('color');
            break;
    }

    if (actionTaken) {
        //updateHappiness(1);
    }
}

function drawUI() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${guineaPigName}'s Salon Day!`, canvas.width/2, 30);
}

function drawGuineaPig() {
    if (isFrontView) {
        drawFrontViewGuineaPig();
        drawHair(faceHair);
        drawFrontViewFace();
        // Only draw accessories in front view
        if (accessories.bow.active) drawBow();
        if (accessories.hat.active) drawHat();
        if (accessories.glasses.active) drawGlasses();
        if (accessories.bowtie.active) drawBowtie();
    } else {
        drawSideViewGuineaPig();
        drawHair(bodyHair);
        drawSideViewFace();
    }
}

function drawHair(hairArray) {
    hairArray.forEach(hair => {
        if (!hair.cut) {
            ctx.strokeStyle = hair.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(hair.x, hair.y);
            ctx.lineTo(
                hair.x + Math.cos(hair.angle) * hair.length,
                hair.y + Math.sin(hair.angle) * hair.length
            );
            ctx.stroke();
        }
    });
}

function drawFrontViewFace() {
    // Eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(guineaPig.x - 25, guineaPig.y - 10, 8, 0, Math.PI * 2);
    ctx.arc(guineaPig.x + 25, guineaPig.y - 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = 'pink';
    ctx.beginPath();
    ctx.ellipse(guineaPig.x, guineaPig.y + 20, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#663300';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(guineaPig.x, guineaPig.y + 35, 10, 0.1, Math.PI - 0.1);
    ctx.stroke();
}

function drawSideViewFace() {
    // Eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(guineaPig.x + 70, guineaPig.y - 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(guineaPig.x + 70, guineaPig.y + 20, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Nose
    ctx.fillStyle = 'pink';
    ctx.beginPath();
    ctx.ellipse(guineaPig.x + 90, guineaPig.y, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawFrontViewGuineaPig() {
    // Draw round body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(guineaPig.x, guineaPig.y, guineaPig.height / 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw spots
    drawSpots();

    // Draw ears with darker shade
    const earColor = darkenColor(bodyColor);
    ctx.fillStyle = earColor;
    const earSize = 25;

    // Left ear (fixed position and angle)
    ctx.beginPath();
    ctx.save();
    ctx.translate(guineaPig.x - 50, guineaPig.y - 50);
    ctx.rotate(-Math.PI/6);
    ctx.ellipse(0, 0, earSize, earSize/1.5, 0, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // Right ear (fixed position and angle)
    ctx.beginPath();
    ctx.save();
    ctx.translate(guineaPig.x + 50, guineaPig.y - 50);
    ctx.rotate(Math.PI/6);
    ctx.ellipse(0, 0, earSize, earSize/1.5, 0, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();
}

function drawSideViewGuineaPig() {
    // Draw body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(guineaPig.x, guineaPig.y, guineaPig.width / 2, guineaPig.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw spots
    drawSpots();

    // Draw tail
    const tailColor = darkenColor(bodyColor);
    ctx.fillStyle = tailColor;
    ctx.beginPath();
    // Draw a cute round tail at the back
    const tailX = guineaPig.x - guineaPig.width/2 + 10;
    const tailY = guineaPig.y - 10;
    ctx.arc(tailX, tailY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw ears (slightly darker than body)
    ctx.fillStyle = tailColor;
    // Left ear
    ctx.beginPath();
    ctx.ellipse(guineaPig.x + 60, guineaPig.y - 35, 20, 15, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    // Right ear
    ctx.beginPath();
    ctx.ellipse(guineaPig.x + 60, guineaPig.y + 35, 20, 15, -Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
}

function drawGlasses() {
    ctx.strokeStyle = currentAccessoryColor;
    ctx.lineWidth = 3;
    
    // Left lens
    ctx.beginPath();
    ctx.arc(guineaPig.x - 25, guineaPig.y - 10, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    // Right lens
    ctx.beginPath();
    ctx.arc(guineaPig.x + 25, guineaPig.y - 10, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    // Bridge
    ctx.beginPath();
    ctx.moveTo(guineaPig.x - 10, guineaPig.y - 10);
    ctx.lineTo(guineaPig.x + 10, guineaPig.y - 10);
    ctx.stroke();
}

function drawHat() {
    ctx.fillStyle = currentAccessoryColor;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    // Draw complete hat with proper perspective
    // Hat brim
    ctx.beginPath();
    ctx.ellipse(guineaPig.x, guineaPig.y - 85, 60, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(guineaPig.x, guineaPig.y - 85, 60, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Hat body (cylinder) - fill only
    ctx.beginPath();
    ctx.moveTo(guineaPig.x - 35, guineaPig.y - 85);
    ctx.lineTo(guineaPig.x - 35, guineaPig.y - 130);
    ctx.lineTo(guineaPig.x + 35, guineaPig.y - 130);
    ctx.lineTo(guineaPig.x + 35, guineaPig.y - 85);
    ctx.fill();
    
    // Draw only the side lines of the cylinder
    ctx.beginPath();
    ctx.moveTo(guineaPig.x - 35, guineaPig.y - 85);
    ctx.lineTo(guineaPig.x - 35, guineaPig.y - 130);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(guineaPig.x + 35, guineaPig.y - 85);
    ctx.lineTo(guineaPig.x + 35, guineaPig.y - 130);
    ctx.stroke();
    
    // Hat top
    ctx.beginPath();
    ctx.ellipse(guineaPig.x, guineaPig.y - 130, 35, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Add a decorative band
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.rect(guineaPig.x - 35, guineaPig.y - 100, 70, 10);
    ctx.fill();
}

function drawBow() {
    ctx.fillStyle = currentAccessoryColor;
    
    // Left loop
    ctx.beginPath();
    ctx.ellipse(guineaPig.x - 15, guineaPig.y - 70, 10, 15, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Right loop
    ctx.beginPath();
    ctx.ellipse(guineaPig.x + 15, guineaPig.y - 70, 10, 15, -Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Center knot
    ctx.beginPath();
    ctx.arc(guineaPig.x, guineaPig.y - 70, 5, 0, Math.PI * 2);
    ctx.fill();
}

function drawBowtie() {
    ctx.fillStyle = currentAccessoryColor;
    
    // Left triangle
    ctx.beginPath();
    ctx.moveTo(guineaPig.x, guineaPig.y + 45);
    ctx.lineTo(guineaPig.x - 15, guineaPig.y + 35);
    ctx.lineTo(guineaPig.x - 15, guineaPig.y + 55);
    ctx.closePath();
    ctx.fill();
    
    // Right triangle
    ctx.beginPath();
    ctx.moveTo(guineaPig.x, guineaPig.y + 45);
    ctx.lineTo(guineaPig.x + 15, guineaPig.y + 35);
    ctx.lineTo(guineaPig.x + 15, guineaPig.y + 55);
    ctx.closePath();
    ctx.fill();
    
    // Center knot
    ctx.beginPath();
    ctx.arc(guineaPig.x, guineaPig.y + 45, 3, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGuineaPig();
    drawUI();
    
    // Draw accessories in front view
    if (isFrontView) {
        if (accessories.bow.active) drawBow();
        if (accessories.glasses.active) drawGlasses();
        if (accessories.bowtie.active) drawBowtie();
    }
    // Hat is visible in both views
    if (accessories.hat.active) drawHat();
    
    requestAnimationFrame(gameLoop);
}

// Color picker event listener
document.getElementById('colorPicker').addEventListener('input', (e) => {
    if (currentColor !== e.target.value) {
        currentColor = e.target.value;
        playSoundWithCooldown('color');
    }
});

// Body color picker
document.getElementById('bodyColorPicker').addEventListener('input', (e) => {
    if (bodyColor !== e.target.value) {
        bodyColor = e.target.value;
        playSoundWithCooldown('color');
    }
});

// Tool buttons
const tools = ['scissors', 'brush', 'dye', 'paintbrush'];
tools.forEach(tool => {
    document.getElementById(tool).addEventListener('click', () => {
        currentTool = tool;
        tools.forEach(t => {
            document.getElementById(t).classList.remove('selected');
        });
        document.getElementById(tool).classList.add('selected');
    });
});

// Accessory event listeners
const accessoryButtons = ['bow', 'hat', 'glasses', 'bowtie'];
accessoryButtons.forEach(accessory => {
    document.getElementById(accessory).addEventListener('click', () => {
        toggleAccessory(accessory);
        playSoundWithCooldown('accessory');
        
        // Toggle button selection
        const button = document.getElementById(accessory);
        if (accessories[accessory].active) {
            accessoryButtons.forEach(a => document.getElementById(a).classList.remove('selected'));
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
});

// Accessory color picker
document.getElementById('accessoryColorPicker').addEventListener('input', (e) => {
    currentAccessoryColor = e.target.value;
    playSoundWithCooldown('color');
});

// View toggle button event listener
document.getElementById('viewToggle').addEventListener('click', () => {
    isFrontView = !isFrontView;
    const viewButton = document.getElementById('viewToggle');
    const accessoryDiv = document.querySelector('.accessories');
    
    if (isFrontView) {
        viewButton.textContent = 'Side View';
        // Show only front-view accessories (glasses, hat)
        accessoryDiv.style.display = 'flex';
        document.getElementById('glasses').style.display = 'block';
        document.getElementById('hat').style.display = 'block';
        document.getElementById('bow').style.display = 'none';
        document.getElementById('bowtie').style.display = 'none';
        // Disable active accessories that aren't visible in this view
        if (accessories.bow.active || accessories.bowtie.active) {
            accessories.bow.active = false;
            accessories.bowtie.active = false;
            document.getElementById('bow').classList.remove('selected');
            document.getElementById('bowtie').classList.remove('selected');
        }
    } else {
        viewButton.textContent = 'Front View';
        // Show only side-view accessories (bow, bowtie)
        accessoryDiv.style.display = 'flex';
        document.getElementById('glasses').style.display = 'none';
        document.getElementById('hat').style.display = 'none';
        document.getElementById('bow').style.display = 'block';
        document.getElementById('bowtie').style.display = 'block';
        // Disable active accessories that aren't visible in this view
        if (accessories.glasses.active || accessories.hat.active) {
            accessories.glasses.active = false;
            accessories.hat.active = false;
            document.getElementById('glasses').classList.remove('selected');
            document.getElementById('hat').classList.remove('selected');
        }
    }
});

// Initialize accessory visibility
function initializeAccessoryVisibility() {
    const accessoryDiv = document.querySelector('.accessories');
    accessoryDiv.style.display = 'flex';
    
    if (isFrontView) {
        document.getElementById('glasses').style.display = 'block';
        document.getElementById('hat').style.display = 'block';
        document.getElementById('bow').style.display = 'none';
        document.getElementById('bowtie').style.display = 'none';
    } else {
        document.getElementById('glasses').style.display = 'none';
        document.getElementById('hat').style.display = 'none';
        document.getElementById('bow').style.display = 'block';
        document.getElementById('bowtie').style.display = 'block';
    }
}

// Mouse interaction
canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    handleGrooming(e);
});
canvas.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        handleGrooming(e);
    }
});
canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

// Function to update zoom level and canvas scale
function updateZoom(value) {
    zoomLevel = value / 100;
    canvasScale.x = zoomLevel;
    canvasScale.y = zoomLevel;

    // Update canvas style
    canvas.style.transform = `scale(${zoomLevel})`;
    canvas.style.transformOrigin = 'top left';

    // Update zoom value display
    const zoomValueDisplay = document.getElementById('zoomValue');
    if (zoomValueDisplay) {
        zoomValueDisplay.textContent = `${value}%`;
    }

    // Redraw the canvas
    drawUI();
}

// Add zoom slider event listener
const zoomSlider = document.getElementById('zoomSlider');
zoomSlider.addEventListener('input', (e) => {
    updateZoom(e.target.value);
});

// Update getCanvasPosition to account for zoom
function getCanvasPosition(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (clientX - rect.left) / zoomLevel,
        y: (clientY - rect.top) / zoomLevel
    };
}

// Initialize canvas with proper zoom
function initializeCanvas() {
    // Set initial zoom level
    const zoomSlider = document.getElementById('zoomSlider');
    if (zoomSlider) {
        updateZoom(zoomSlider.value);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const bodyColorPicker = document.getElementById('bodyColorPicker');
    if (bodyColorPicker) {
        bodyColorPicker.value = bodyColor;
    }
});

function toggleAccessory(accessory) {
    if (!isFrontView && accessory !== 'hat') {
        return; // Only hat is visible in side view
    }
    accessories[accessory].active = !accessories[accessory].active;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGuineaPig();
    drawUI();
    
    // Draw accessories in front view
    if (isFrontView) {
        if (accessories.bow.active) drawBow();
        if (accessories.glasses.active) drawGlasses();
        if (accessories.bowtie.active) drawBowtie();
    }
    // Hat is visible in both views
    if (accessories.hat.active) drawHat();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
function initializeGame() {
    generateGuineaPigName();
    bodyColor = generateRandomGuineaPigColor();
    bodyHair = [];
    faceHair = [];
    initializeSpots();
    currentTool = 'brush';
    currentColor = bodyColor; // Start with hair color matching body
    currentAccessoryColor = '#ff0000';
    isFrontView = false;
    accessories = {
        bow: { active: false },
        glasses: { active: false },
        hat: { active: false },
        bowtie: { active: false }
    };
    initializeAccessoryVisibility();
    initializeCanvas();
}

initializeGame();
gameLoop();
