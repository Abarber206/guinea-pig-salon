const guineaPigNames = [
    'Peanut', 'Cookie', 'Nibbles', 'Ginger', 'Oreo',
    'Marshmallow', 'Pepper', 'Maple', 'Cocoa', 'Biscuit',
    'Waffle', 'Mochi', 'Pudding', 'Pickles', 'Nutmeg',
    'Cinnamon', 'Popcorn', 'Cheerio', 'Noodle', 'Bean',
    'Snuggles', 'Bubbles', 'Waffles', 'Squeaks', 'Whiskers',
    'Taylor'
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

function generateRandomPink() {
    // Red will be high (220-255)
    // Green will be moderate (160-190)
    // Blue will be lower (150-170) to avoid purple tints
    const red = Math.floor(Math.random() * 36) + 220;   // 220-255
    const green = Math.floor(Math.random() * 31) + 160; // 160-190
    const blue = Math.floor(Math.random() * 21) + 150;  // 150-170
    return `rgb(${red}, ${green}, ${blue})`;
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

// Helper function to lighten a color
function lightenColor(color) {
    // Convert hex to RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    // Lighten by 15%
    r = Math.min(255, r + Math.floor((255 - r) * 0.15));
    g = Math.min(255, g + Math.floor((255 - g) * 0.15));
    b = Math.min(255, b + Math.floor((255 - b) * 0.15));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Function to check if a point is near a spot
function getNearbySpot(x, y) {
    const checkSpots = spots.filter(spot => {
        const spotX = isFrontView ? spot.frontX : spot.sideX;
        const spotY = isFrontView ? spot.frontY : spot.sideY;
        const distance = Math.sqrt(Math.pow(x - spotX, 2) + Math.pow(y - spotY, 2));
        return distance <= spot.radius + 5; // Add 5px tolerance
    });
    return checkSpots[0]; // Return the first matching spot or undefined
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

// Game state
let currentTool = 'scissors';
let bodyHair = [];  // Hair for the body (visible in side view)
let faceHair = [];  // Hair for the face (visible in front view)
let currentColor = '#8B4513'; // Default brown color
let currentAccessoryColor = '#FF69B4';
let bodyColor = '#8B4513';
let isMouseDown = false;
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let accessories = {
    front: {
        bow: false,
        hat: false,
        glasses: false,
        bowtie: false
    },
    side: {
        bow: false,
        hat: false,
        glasses: false,
        bowtie: false
    }
};
let spots = [];

// View state
let isFrontView = false;

// Guinea pig properties
const guineaPig = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 200,
    height: 120,
    happiness: 100,
    pinkColor: '',  // Single pink color for nose and ears
    whiskers: {
        frontLeft: [],
        frontRight: [],
        sideUpper: [],
        sideLower: []
    }
};

// Hair properties
const HAIR_LENGTH = 15;
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
    
    const spot = getNearbySpot(x, y);
    
    bodyHair.push({
        x: x,
        y: y,
        angle: angle,
        length: HAIR_LENGTH,
        cut: false,
        color: spot ? adjustColorForSpot(bodyColor, spot) : varyColor(bodyColor)
    });
}

function addFaceHair() {
    const angle = Math.random() * Math.PI * 2;
    const radius = (guineaPig.height/1.5) * Math.sqrt(Math.random()) * 0.8;
    
    const x = guineaPig.x + Math.cos(angle) * radius;
    const y = guineaPig.y + Math.sin(angle) * radius;
    
    const spot = getNearbySpot(x, y);
    
    faceHair.push({
        x: x,
        y: y,
        angle: angle,
        length: HAIR_LENGTH,
        cut: false,
        color: spot ? adjustColorForSpot(bodyColor, spot) : varyColor(bodyColor)
    });
}

function addHairAtPosition(x, y) {
    const dx = (x - guineaPig.x);
    const dy = (y - guineaPig.y);
    
    if (isFrontView) {
        // Check if point is in inner ear regions
        const leftInnerEarDist = Math.sqrt(
            Math.pow(x - (guineaPig.x - 50), 2) + 
            Math.pow(y - (guineaPig.y - 50), 2)
        );
        const rightInnerEarDist = Math.sqrt(
            Math.pow(x - (guineaPig.x + 50), 2) + 
            Math.pow(y - (guineaPig.y - 50), 2)
        );
        
        // Don't place hair if inside inner ear regions
        const earSize = 25;
        if (leftInnerEarDist <= earSize/1.8 || rightInnerEarDist <= earSize/1.8) {
            return false;
        }

        // Use larger area for hair placement while keeping face size the same
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        const hairPlacementRadius = guineaPig.width / 2.2;
        
        if (distanceFromCenter <= hairPlacementRadius) {
            const angle = Math.atan2(dy, dx);
            
            // Check if we're in an ear region - more precise detection
            const leftEarX = guineaPig.x - 50;
            const rightEarX = guineaPig.x + 50;
            const earY = guineaPig.y - 50;
            const isInLeftEar = Math.sqrt(Math.pow(x - leftEarX, 2) + Math.pow(y - earY, 2)) <= earSize * 1.2;
            const isInRightEar = Math.sqrt(Math.pow(x - rightEarX, 2) + Math.pow(y - earY, 2)) <= earSize * 1.2;
            
            let hairColor;
            const spot = getNearbySpot(x, y);
            
            // Special hair colors for Taylor
            if (guineaPigName === 'Taylor') {
                let baseColor;
                const variation = Math.random();
                if (variation < 0.33) {
                    baseColor = '#FFB6C1';  // Slightly darker pink
                } else if (variation < 0.66) {
                    baseColor = '#FFD1DC';  // Same as body
                } else {
                    baseColor = '#FFE4E8';  // Lighter pink
                }
                
                if (isInLeftEar || isInRightEar) {
                    hairColor = darkenColor(baseColor);
                } else if (spot) {
                    hairColor = adjustColorForSpot(baseColor, spot);
                } else {
                    hairColor = baseColor;
                }
            } else {
                if (isInLeftEar || isInRightEar) {
                    hairColor = darkenColor(darkenColor(currentColor)); // Double darken for ear hair
                } else if (spot) {
                    hairColor = adjustColorForSpot(currentColor, spot);
                } else {
                    hairColor = varyColor(currentColor);
                }
            }
            
            faceHair.push({
                x: x,
                y: y,
                angle: angle,
                length: 15,
                cut: false,
                color: hairColor
            });
            return true;
        }
    } else {
        // Side view logic
        const normalizedX = dx / (guineaPig.width / 2);
        const normalizedY = dy / (guineaPig.height / 1.8);
        const isOnBody = (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
        
        if (isOnBody) {
            const spot = getNearbySpot(x, y);
            let hairColor;
            
            // Check if we're in the tail region (back right area)
            const tailX = x - guineaPig.x;
            const tailY = y - guineaPig.y;
            const isTailRegion = tailX > guineaPig.width/2.5 && Math.abs(tailY) < guineaPig.height/4;
            
            // Special hair colors for Taylor
            if (guineaPigName === 'Taylor') {
                let baseColor;
                const variation = Math.random();
                if (variation < 0.33) {
                    baseColor = '#FFB6C1';  // Slightly darker pink
                } else if (variation < 0.66) {
                    baseColor = '#FFD1DC';  // Same as body
                } else {
                    baseColor = '#FFE4E8';  // Lighter pink
                }
                
                if (isTailRegion) {
                    hairColor = darkenColor(baseColor);
                } else if (spot) {
                    hairColor = adjustColorForSpot(baseColor, spot);
                } else {
                    hairColor = baseColor;
                }
            } else {
                if (isTailRegion) {
                    hairColor = darkenColor(currentColor);
                } else if (spot) {
                    hairColor = adjustColorForSpot(currentColor, spot);
                } else {
                    hairColor = varyColor(currentColor);
                }
            }
            
            bodyHair.push({
                x: x,
                y: y,
                angle: Math.atan2(dy, dx),
                length: 15,
                cut: false,
                color: hairColor
            });
            return true;
        }
    }
    return false;
}

function handleGrooming(e) {
    const x = e.offsetX;
    const y = e.offsetY;

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
        // Draw accessories in front view
        const view = 'front';
        if (accessories[view].bow) drawBow();
        if (accessories[view].hat) drawHat();
        if (accessories[view].glasses) drawGlasses();
        if (accessories[view].bowtie) drawBowtie();
    } else {
        drawSideViewGuineaPig();
        drawHair(bodyHair);
        drawSideViewFace();
        // Only draw hat in side view if it's enabled for side view
        if (accessories.side.hat) drawHat();
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
    ctx.fillStyle = guineaPig.pinkColor;
    ctx.beginPath();
    ctx.ellipse(guineaPig.x, guineaPig.y + 20, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#663300';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(guineaPig.x, guineaPig.y + 35, 10, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = '#DDDDDD';
    ctx.lineWidth = 1.5;
    
    // Left whiskers
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(guineaPig.x - 15, guineaPig.y + 20 + (i * 5 - 5));
        ctx.quadraticCurveTo(
            guineaPig.x - 35, 
            guineaPig.y + 15 + (i * 5 - 5),
            guineaPig.x - 50 * guineaPig.whiskers.frontLeft[i], 
            guineaPig.y + 10 + (i * 8 - 8)
        );
        ctx.stroke();
    }

    // Right whiskers
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(guineaPig.x + 15, guineaPig.y + 20 + (i * 5 - 5));
        ctx.quadraticCurveTo(
            guineaPig.x + 35, 
            guineaPig.y + 15 + (i * 5 - 5),
            guineaPig.x + 50 * guineaPig.whiskers.frontRight[i], 
            guineaPig.y + 10 + (i * 8 - 8)
        );
        ctx.stroke();
    }
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
    ctx.fillStyle = guineaPig.pinkColor;
    ctx.beginPath();
    ctx.ellipse(guineaPig.x + 90, guineaPig.y, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#DDDDDD';
    ctx.lineWidth = 1.5;
    
    // Upper whiskers
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(guineaPig.x + 85, guineaPig.y - 5);
        ctx.quadraticCurveTo(
            guineaPig.x + 100,
            guineaPig.y - 15 + (i * 10 - 10),
            guineaPig.x + 115 * guineaPig.whiskers.sideUpper[i],
            guineaPig.y - 20 + (i * 15 - 15)
        );
        ctx.stroke();
    }

    // Lower whiskers
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(guineaPig.x + 85, guineaPig.y + 5);
        ctx.quadraticCurveTo(
            guineaPig.x + 100,
            guineaPig.y + 15 + (i * 10 - 10),
            guineaPig.x + 115 * guineaPig.whiskers.sideLower[i],
            guineaPig.y + 20 + (i * 15 - 15)
        );
        ctx.stroke();
    }
}

function drawFrontViewGuineaPig() {
    // Draw round body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(guineaPig.x, guineaPig.y, guineaPig.height / 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw inner face circle with lighter color
    ctx.fillStyle = lightenColor(bodyColor);
    ctx.beginPath();
    ctx.arc(guineaPig.x, guineaPig.y + 10, guineaPig.width / 3.5, 0, Math.PI * 2);
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

    // Add pink inner ear details
    ctx.fillStyle = guineaPig.pinkColor;  // Light pink color
    
    // Left inner ear
    ctx.beginPath();
    ctx.save();
    ctx.translate(guineaPig.x - 50, guineaPig.y - 50);
    ctx.rotate(-Math.PI/6);
    ctx.ellipse(0, 0, earSize/1.8, earSize/2.3, 0, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // Right inner ear
    ctx.beginPath();
    ctx.save();
    ctx.translate(guineaPig.x + 50, guineaPig.y - 50);
    ctx.rotate(Math.PI/6);
    ctx.ellipse(0, 0, earSize/1.8, earSize/2.3, 0, 0, Math.PI * 2);
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
    if (!isFrontView) return;
    
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
    if (!isFrontView) return;

    ctx.fillStyle = currentAccessoryColor;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    // Draw complete hat with proper perspective
    // Hat brim
    ctx.beginPath();
    ctx.ellipse(guineaPig.x, guineaPig.y - 75, 60, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(guineaPig.x, guineaPig.y - 75, 60, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Hat body (cylinder) - fill only
    ctx.beginPath();
    ctx.moveTo(guineaPig.x - 35, guineaPig.y - 75);
    ctx.lineTo(guineaPig.x - 35, guineaPig.y - 110);  // Reduced height from -120
    ctx.lineTo(guineaPig.x + 35, guineaPig.y - 110);  // Reduced height from -120
    ctx.lineTo(guineaPig.x + 35, guineaPig.y - 75);
    ctx.fill();
    
    // Draw only the side lines of the cylinder
    ctx.beginPath();
    ctx.moveTo(guineaPig.x - 35, guineaPig.y - 75);
    ctx.lineTo(guineaPig.x - 35, guineaPig.y - 110);  // Reduced height from -120
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(guineaPig.x + 35, guineaPig.y - 75);
    ctx.lineTo(guineaPig.x + 35, guineaPig.y - 110);  // Reduced height from -120
    ctx.stroke();
    
    // Hat top
    ctx.beginPath();
    ctx.ellipse(guineaPig.x, guineaPig.y - 110, 35, 12, 0, 0, Math.PI * 2);  // Reduced height from -120
    ctx.fill();
    ctx.stroke();
    
    // Add a decorative band - using the same color as the hat
    ctx.beginPath();
    ctx.rect(guineaPig.x - 35, guineaPig.y - 90, 70, 10);
    ctx.fill();
}

function drawBow() {
    if (!isFrontView) return;
    
    ctx.fillStyle = currentAccessoryColor;
    
    // Left loop
    ctx.beginPath();
    ctx.ellipse(guineaPig.x - 15, guineaPig.y - 55, 10, 15, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Right loop
    ctx.beginPath();
    ctx.ellipse(guineaPig.x + 15, guineaPig.y - 55, 10, 15, -Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Center knot
    ctx.beginPath();
    ctx.arc(guineaPig.x, guineaPig.y - 55, 5, 0, Math.PI * 2);
    ctx.fill();
}

function drawBowtie() {
    if (!isFrontView) return;
    
    ctx.fillStyle = currentAccessoryColor;
    
    // Left triangle
    ctx.beginPath();
    ctx.moveTo(guineaPig.x, guineaPig.y + 55);  
    ctx.lineTo(guineaPig.x - 15, guineaPig.y + 45);  
    ctx.lineTo(guineaPig.x - 15, guineaPig.y + 65);  
    ctx.closePath();
    ctx.fill();
    
    // Right triangle
    ctx.beginPath();
    ctx.moveTo(guineaPig.x, guineaPig.y + 55);  
    ctx.lineTo(guineaPig.x + 15, guineaPig.y + 45);  
    ctx.lineTo(guineaPig.x + 15, guineaPig.y + 65);  
    ctx.closePath();
    ctx.fill();
    
    // Center knot
    ctx.beginPath();
    ctx.arc(guineaPig.x, guineaPig.y + 55, 3, 0, Math.PI * 2);  
    ctx.fill();
}

function drawAccessories() {
    const view = isFrontView ? 'front' : 'side';
    
    // Only draw if in front view and the accessory is enabled for front view
    if (isFrontView) {
        if (accessories[view].bow) drawBow();
        if (accessories[view].hat) drawHat();
        if (accessories[view].glasses) drawGlasses();
        if (accessories[view].bowtie) drawBowtie();
    }
}

function drawHitbox() {
    // Function remains for future debugging but doesn't draw anything
    return;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background with current theme
    ctx.fillStyle = themes[currentTheme];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGuineaPig();
    drawAccessories();
    drawHitbox();  // Add hitbox visualization
    drawUI();
    
    requestAnimationFrame(gameLoop);
}

// Theme management
const themes = {
    "White": "#FFFFFF",
    "Light Green": "#90EE90",
    "Light Orange": "#FFE4C4",
    "Dark Gray": "#4A4A4A",
    "Light Pink": "#FFE4E1"
};
let currentTheme = "White";

function changeTheme(themeName) {
    if (themes[themeName]) {
        currentTheme = themeName;
        drawGame(); // Redraw the game with new background
    }
}

function createThemeBox() {
    const themeBox = document.createElement('div');
    themeBox.style.position = 'fixed';
    themeBox.style.bottom = '10px';
    themeBox.style.left = '50%';
    themeBox.style.transform = 'translateX(-50%)';
    themeBox.style.width = 'auto';
    themeBox.style.textAlign = 'center';
    themeBox.style.padding = '5px';
    themeBox.style.backgroundColor = '#f0f0f0';
    themeBox.style.zIndex = '1000';
    themeBox.style.borderRadius = '5px';
    themeBox.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    Object.keys(themes).forEach(themeName => {
        const button = document.createElement('button');
        button.innerText = themeName;
        button.style.margin = '0 5px';
        button.style.padding = '5px 10px';
        button.style.border = '1px solid #ccc';
        button.style.borderRadius = '3px';
        button.style.backgroundColor = '#fff';
        button.style.cursor = 'pointer';
        button.onclick = () => changeTheme(themeName);
        themeBox.appendChild(button);
    });

    document.body.appendChild(themeBox);
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

// Add touch event handling for buttons
function initializeToolButtons() {
    // Tool selection
    const tools = ['scissors', 'brush', 'dye', 'paintbrush'];
    tools.forEach(tool => {
        const button = document.getElementById(tool);
        button.addEventListener('touchstart', function(e) {
            e.preventDefault();
            currentTool = tool;
            // Remove selected class from all tools
            tools.forEach(t => document.getElementById(t).classList.remove('selected'));
            // Add selected class to current tool
            button.classList.add('selected');
        });
    });

    // View toggle
    const viewToggle = document.getElementById('viewToggle');
    viewToggle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        isFrontView = !isFrontView;
    });

    // Accessories
    const accessories = ['bow', 'hat', 'glasses', 'bowtie'];
    accessories.forEach(accessory => {
        const button = document.getElementById(accessory);
        button.addEventListener('touchstart', function(e) {
            e.preventDefault();
            toggleAccessory(accessory);
            // Toggle selected class
            button.classList.toggle('selected');
            playSoundWithCooldown('accessory');
        });
    });

    // Color pickers
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', function(e) {
        currentColor = e.target.value;
        playSoundWithCooldown('color');
    });
    colorPicker.addEventListener('touchstart', function(e) {
        e.stopPropagation(); // Prevent canvas from receiving the touch event
    });

    const accessoryColorPicker = document.getElementById('accessoryColorPicker');
    accessoryColorPicker.addEventListener('input', function(e) {
        currentAccessoryColor = e.target.value;
        playSoundWithCooldown('color');
    });
    accessoryColorPicker.addEventListener('touchstart', function(e) {
        e.stopPropagation(); // Prevent canvas from receiving the touch event
    });

    const bodyColorPicker = document.getElementById('bodyColorPicker');
    bodyColorPicker.addEventListener('input', function(e) {
        bodyColor = e.target.value;
        playSoundWithCooldown('color');
    });
    bodyColorPicker.addEventListener('touchstart', function(e) {
        e.stopPropagation(); // Prevent canvas from receiving the touch event
    });
}

// Accessory event listeners
const accessoryButtons = ['bow', 'hat', 'glasses', 'bowtie'];
accessoryButtons.forEach(accessory => {
    document.getElementById(accessory).addEventListener('click', () => {
        toggleAccessory(accessory);
        playSoundWithCooldown('accessory');
        
        // Toggle button selection
        const button = document.getElementById(accessory);
        if (accessories[isFrontView ? 'front' : 'side'][accessory]) {
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

// View toggle button
document.getElementById('viewToggle').addEventListener('click', () => {
    isFrontView = !isFrontView;
    
    // Show/hide accessory buttons based on view
    const accessoryDiv = document.querySelector('.accessories');
    if (isFrontView) {
        accessoryDiv.style.display = 'flex';
    } else {
        accessoryDiv.style.display = 'none';
        // Remove all accessories when switching to side view
        Object.keys(accessories.side).forEach(acc => {
            accessories.side[acc] = false;
            document.getElementById(acc).classList.remove('selected');
        });
    }
});

function initializeCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size to match container
    canvas.width = 800;
    canvas.height = 600;
    
    // Center the guinea pig
    guineaPig.x = canvas.width / 2;
    guineaPig.y = canvas.height / 2;
    
    // Set canvas background color
    canvas.style.backgroundColor = themes[currentTheme];
    canvas.style.display = 'block';
    canvas.style.margin = 'auto';
    
    // Make sure container fits canvas exactly
    const container = document.querySelector('.canvas-container');
    if (container) {
        container.style.width = '800px';
        container.style.height = '600px';
        container.style.margin = 'auto';
        container.style.position = 'relative';
        container.style.backgroundColor = themes[currentTheme];
    }

    // Get accurate mouse/touch position
    function getCanvasPosition(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    // Mouse event handlers
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        const pos = getCanvasPosition(e.clientX, e.clientY);
        handleGrooming({ offsetX: pos.x, offsetY: pos.y });
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            const pos = getCanvasPosition(e.clientX, e.clientY);
            handleGrooming({ offsetX: pos.x, offsetY: pos.y });
        }
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
    });

    // Touch event handlers
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const pos = getCanvasPosition(touch.clientX, touch.clientY);
        handleGrooming({ offsetX: pos.x, offsetY: pos.y });
    });

    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const pos = getCanvasPosition(touch.clientX, touch.clientY);
        handleGrooming({ offsetX: pos.x, offsetY: pos.y });
    });
}

// Initialize the game
function initializeGame() {
    generateGuineaPigName();
    // Special color for Taylor
    if (guineaPigName === 'Taylor') {
        bodyColor = '#FFD1DC';  // Soft pink
        currentColor = '#FFD1DC';  // Start with body color for hair
    } else {
        bodyColor = generateRandomGuineaPigColor();
        currentColor = bodyColor; // Start with body color for hair
    }
    guineaPig.pinkColor = generateRandomPink();
    initializeWhiskers();
    document.getElementById('bodyColorPicker').value = bodyColor;
    document.getElementById('colorPicker').value = currentColor; // Set color picker to match body color
    initializeSpots();
    initializeHair();
    initializeCanvas();
    initializeToolButtons();
    currentTool = 'brush';
    currentAccessoryColor = '#FF69B4';
    isFrontView = false;
    accessories = {
        front: {
            bow: false,
            hat: false,
            glasses: false,
            bowtie: false
        },
        side: {
            bow: false,
            hat: false,
            glasses: false,
            bowtie: false
        }
    };

    // Set initial selected tool
    document.getElementById('brush').classList.add('selected');
}

document.addEventListener('DOMContentLoaded', () => {
    const bodyColorPicker = document.getElementById('bodyColorPicker');
    if (bodyColorPicker) {
        bodyColorPicker.value = bodyColor;
    }
});

function toggleAccessory(accessory) {
    const view = isFrontView ? 'front' : 'side';
    
    // Check for incompatible accessories
    if (accessory === 'hat' && accessories[view].bow) {
        // If trying to equip hat while bow is on, remove bow first
        accessories[view].bow = false;
        document.getElementById('bow').classList.remove('selected');
    } else if (accessory === 'bow' && accessories[view].hat) {
        // If trying to equip bow while hat is on, remove hat first
        accessories[view].hat = false;
        document.getElementById('hat').classList.remove('selected');
    }
    
    // Toggle the requested accessory
    accessories[view][accessory] = !accessories[view][accessory];
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background with current theme
    ctx.fillStyle = themes[currentTheme];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGuineaPig();
    drawAccessories();
    drawHitbox();  // Add hitbox visualization
    drawUI();
    
    requestAnimationFrame(gameLoop);
}

function initializeWhiskers() {
    // Front view whiskers
    for (let i = 0; i < 3; i++) {
        guineaPig.whiskers.frontLeft[i] = 0.8 + Math.random() * 0.4;  // 0.8 to 1.2
        guineaPig.whiskers.frontRight[i] = 0.8 + Math.random() * 0.4;
    }
    // Side view whiskers
    for (let i = 0; i < 3; i++) {
        guineaPig.whiskers.sideUpper[i] = 0.85 + Math.random() * 0.3;  // 0.85 to 1.15
        guineaPig.whiskers.sideLower[i] = 0.85 + Math.random() * 0.3;
    }
}

function isValidHairPosition(x, y) {
    if (isFrontView) {
        // Check if point is in inner ear regions
        const leftInnerEarDist = Math.sqrt(
            Math.pow(x - (guineaPig.x - 50), 2) + 
            Math.pow(y - (guineaPig.y - 50), 2)
        );
        const rightInnerEarDist = Math.sqrt(
            Math.pow(x - (guineaPig.x + 50), 2) + 
            Math.pow(y - (guineaPig.y - 50), 2)
        );
        
        // Don't place hair if inside inner ear regions
        const earSize = 25;
        if (leftInnerEarDist <= earSize/1.8 || rightInnerEarDist <= earSize/1.8) {
            return false;
        }

        // Use larger area for hair placement while keeping face size the same
        const distanceFromCenter = Math.sqrt(Math.pow(x - guineaPig.x, 2) + Math.pow(y - guineaPig.y, 2));
        const hairPlacementRadius = guineaPig.width / 2.2;
        
        return distanceFromCenter <= hairPlacementRadius;
    } else {
        // Keep existing side view logic
        const normalizedX = (x - guineaPig.x) / (guineaPig.width / 2);
        const normalizedY = (y - guineaPig.y) / (guineaPig.height / 1.8);
        const isOnBody = (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
        return isOnBody;
    }
}

window.onload = function() {
    createThemeBox();
    initializeGame();
    gameLoop();
};
