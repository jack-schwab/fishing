const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let crankCount = 0;
let targetCrank = 0;
let fish = { x: Math.random() * 600 + 100, y: 450, size: 30, caught: false };
let fishing = false;
let ripples = [];
let fisherman = { x: 100, y: 300, rodAngle: -30, rodDirection: 1 };

// Water ripple animation settings
const rippleColors = ["rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.1)"];

const splashSound = new Audio('https://www.fesliyanstudios.com/play-mp3/387'); // Splash sound
const catchSound = new Audio('https://www.fesliyanstudios.com/play-mp3/547'); // Catch sound

// Start fishing game
function startFishing() {
    crankCount = 0;
    targetCrank = Math.floor(Math.random() * 50) + 10;
    const fishSizeFactor = targetCrank / 50; // Scale fish size based on target cranks
    fish = {
        x: Math.random() * 600 + 100,
        y: 450,
        size: 30 + fishSizeFactor * 50,
        caught: false
    };
    fishing = true;

    ripples.push({ x: fish.x, y: fish.y, radius: 0 }); // Initial ripple for fish splash
    splashSound.play();

    document.getElementById("crankDisplay").innerText = "Cranks: 0";
    document.getElementById("gameMessage").innerText = `Catch the fish! Crank ${targetCrank} times!`;

    animate();
}

// Update crank count
function updateCrankCount(newCount) {
    crankCount = newCount;
    document.getElementById("crankDisplay").innerText = `Cranks: ${crankCount}`;

    if (crankCount >= targetCrank && !fish.caught) {
        fish.caught = true;
        catchSound.play();
        document.getElementById("gameMessage").innerText = "Fish caught!";
        fishing = false;
    }
}

// Draw fisherman
function drawFisherman() {
    // Dock texture
    ctx.fillStyle = ctx.createLinearGradient(0, 300, 0, 350);
    ctx.fillStyle.addColorStop(0, "#8B4513");
    ctx.fillStyle.addColorStop(1, "#5A3220");
    ctx.fillRect(0, 300, 200, 50);
    ctx.fillRect(80, 350, 40, 250); // Dock supports

    // Fisherman body
    ctx.fillStyle = "#FFD700"; // Yellow shirt
    ctx.fillRect(fisherman.x - 10, fisherman.y - 50, 20, 50);

    // Fisherman head
    ctx.beginPath();
    ctx.arc(fisherman.x, fisherman.y - 70, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#FFDAB9"; // Skin tone
    ctx.fill();

    // Fishing rod
    ctx.save();
    ctx.translate(fisherman.x + 10, fisherman.y - 50);
    ctx.rotate((fisherman.rodAngle * Math.PI) / 180);
    ctx.strokeStyle = "#3A3A3A";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(200, -200);
    ctx.stroke();
    ctx.restore();
}

// Draw fish
function drawFish(x, y, size) {
    ctx.fillStyle = "#4682B4"; // Fish body color
    ctx.beginPath();
    ctx.ellipse(x, y, size, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fish fins
    ctx.fillStyle = "#5F9EA0";
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x - size - 20, y - 10);
    ctx.lineTo(x - size - 20, y + 10);
    ctx.closePath();
    ctx.fill();
}

// Draw water ripples
function drawRipples() {
    ripples.forEach((ripple, index) => {
        ripple.radius += 2;
        if (ripple.radius > 100) {
            ripples.splice(index, 1);
        } else {
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = rippleColors[ripple.radius % rippleColors.length];
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

// Draw scene
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, 300);

    // Textured water
    const waterPattern = ctx.createLinearGradient(0, 300, 0, 600);
    waterPattern.addColorStop(0, "#1E90FF");
    waterPattern.addColorStop(1, "#4682B4");
    ctx.fillStyle = waterPattern;
    ctx.fillRect(0, 300, canvas.width, 300);

    drawRipples();
    drawFisherman();
    drawFish(fish.x, fish.y, fish.size);

    // Draw fishing line
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 100);
    ctx.lineTo(fish.x, fish.y);
    ctx.stroke();
}

// Animation loop
function animate() {
    if (fishing) {
        fisherman.rodAngle += fisherman.rodDirection * 0.5; // Rod swaying
        if (fisherman.rodAngle > -25 || fisherman.rodAngle < -35) {
            fisherman.rodDirection *= -1;
        }

        if (!fish.caught && crankCount < targetCrank) {
            fish.y -= 0.5; // Fish moves closer
        }

        drawScene();
        requestAnimationFrame(animate);
    } else {
        drawScene(); // Final scene
    }
}

// WebSocket connection
let ws = new WebSocket("ws://your-server-ip:8080");
ws.onmessage = (event) => {
    if (fishing) {
        updateCrankCount(parseInt(event.data));
    }
};

// Initial draw
drawScene();
